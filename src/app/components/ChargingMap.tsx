"use client";

// 충전소 지도.
//
// 데이터는 /api/chargers(공공데이터포털 프록시), 지도는 Leaflet + OpenStreetMap 타일이라
// 지도 쪽에는 별도 키가 필요 없다. Leaflet은 import 시점에 window를 만지므로 SSR에서
// 터진다 — 그래서 useEffect 안에서 동적 import 한다.
//
// 이 지도의 관점은 하나다: "내 차(국내 사양 Model Y)로 지금 여기서 충전이 되는가".
// 그래서 마커 색이 충전기 개수가 아니라 '내 차로 쓸 수 있는 충전기의 상태'로 갈린다.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import { AlertTriangle, Loader2, MapPin, RefreshCw, Zap } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { chargerStates, chargerTypes, regionPresets, type RegionPreset } from "@/data/charging";

// leaflet 1.9는 package.json에 main(UMD/CJS)만 있고 module·exports 필드가 없다.
// 그래서 동적 import 결과가 번들러 interop에 따라 네임스페이스일 수도, { default }
// 로 감싸인 형태일 수도 있다. 양쪽 다 받도록 여기서 한 번 벗겨낸다.
async function loadLeaflet(): Promise<typeof LeafletNS> {
  const mod = (await import("leaflet")) as unknown as { default?: typeof LeafletNS };
  return mod.default ?? (mod as unknown as typeof LeafletNS);
}

type ChargerRow = {
  chgerId: string;
  chgerType: string;
  stat: string;
  statUpdDt: string;
  output: string;
  method: string;
};

type Station = {
  statId: string;
  statNm: string;
  addr: string;
  location: string;
  lat: number;
  lng: number;
  useTime: string;
  busiNm: string;
  busiCall: string;
  parkingFree: boolean;
  limitYn: boolean;
  limitDetail: string;
  note: string;
  chargers: ChargerRow[];
};

type ApiOk = { stations: Station[]; stationCount: number; chargerCount: number; truncated: boolean };
type ApiErr = { error: string; message: string };

type SpeedFilter = "all" | "fast" | "slow";

// 내 차로 쓸 수 있는 충전기만 추린다. adapter = CCS1 어댑터 필요한 DC 급속,
// slow = J1772 어댑터가 필요한 AC 완속. 차데모·AC3상·수소는 걸러진다.
function usableChargers(station: Station, speed: SpeedFilter) {
  return station.chargers.filter((charger) => {
    const fit = chargerTypes[charger.chgerType]?.tesla;
    if (fit === "adapter") return speed !== "slow";
    if (fit === "slow") return speed !== "fast";
    return false;
  });
}

function stationTone(chargers: ChargerRow[]) {
  if (chargers.some((charger) => chargerStates[charger.stat]?.tone === "free")) return "free";
  if (chargers.some((charger) => chargerStates[charger.stat]?.tone === "busy")) return "busy";
  if (chargers.some((charger) => chargerStates[charger.stat]?.tone === "unknown")) return "unknown";
  return "down";
}

const TONE_COLOR: Record<string, string> = {
  free: "#22c55e",
  busy: "#e8a021",
  down: "#6b7280",
  unknown: "#6b7280"
};

const TONE_LABEL: Record<string, string> = {
  free: "충전 가능",
  busy: "사용 중",
  down: "이용 불가",
  unknown: "상태 미확인"
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string
  );
}

export function ChargingMap() {
  const [region, setRegion] = useState<RegionPreset>(regionPresets[0]);
  const [speed, setSpeed] = useState<SpeedFilter>("all");
  const [onlyUsable, setOnlyUsable] = useState(true);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [data, setData] = useState<ApiOk | null>(null);
  const [error, setError] = useState<ApiErr | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);

  const load = useCallback(async (preset: RegionPreset) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ zcode: preset.zcode });
      if (preset.zscode) params.set("zscode", preset.zscode);
      const response = await fetch(`/api/chargers?${params.toString()}`);
      const payload = await response.json();
      if (!response.ok) {
        setError(payload as ApiErr);
        setData(null);
      } else {
        setData(payload as ApiOk);
      }
    } catch (cause) {
      setError({ error: "NETWORK", message: String(cause) });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(region);
  }, [load, region]);

  // 지도 초기화 — 한 번만.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await loadLeaflet();
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, {
        center: region.center,
        zoom: region.zoom,
        scrollWheelZoom: false,
        attributionControl: true
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap"
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // 최초 1회만 만들고, 이후 지역 변경은 아래 effect가 setView로 처리한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mapRef.current?.setView(region.center, region.zoom);
  }, [region]);

  const stations = useMemo(() => {
    if (!data) return [];
    return data.stations
      .map((station) => {
        const usable = usableChargers(station, speed);
        return { station, usable, tone: stationTone(usable) };
      })
      .filter((entry) => (onlyUsable ? entry.usable.length > 0 : true))
      .filter((entry) => (onlyAvailable ? entry.tone === "free" : true));
  }, [data, speed, onlyUsable, onlyAvailable]);

  // 마커 다시 그리기.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await loadLeaflet();
      if (cancelled || !layerRef.current) return;
      layerRef.current.clearLayers();

      for (const { station, usable, tone } of stations) {
        const color = TONE_COLOR[tone] ?? TONE_COLOR.unknown;
        const marker = L.marker([station.lat, station.lng], {
          icon: L.divIcon({
            className: "charger-pin-wrap",
            html: `<span class="charger-pin" style="--pin:${color}">${usable.length}</span>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          }),
          title: station.statNm
        });

        const typeSummary = [...new Set(usable.map((c) => chargerTypes[c.chgerType]?.short ?? c.chgerType))].join(", ");
        const outputs = [...new Set(usable.map((c) => c.output).filter(Boolean))].join("/");
        marker.bindPopup(
          `<div class="charger-popup">
             <strong>${escapeHtml(station.statNm)}</strong>
             <span class="charger-popup-tone" style="--pin:${color}">${TONE_LABEL[tone]}</span>
             <p>${escapeHtml(station.addr)}</p>
             <dl>
               <div><dt>사업자</dt><dd>${escapeHtml(station.busiNm || "—")}</dd></div>
               <div><dt>내 차 사용 가능</dt><dd>${usable.length}기 · ${escapeHtml(typeSummary || "—")}</dd></div>
               <div><dt>출력</dt><dd>${escapeHtml(outputs || "—")}${outputs ? "kW" : ""}</dd></div>
               <div><dt>이용시간</dt><dd>${escapeHtml(station.useTime || "—")}</dd></div>
               <div><dt>주차료</dt><dd>${station.parkingFree ? "무료" : "유료/확인필요"}</dd></div>
             </dl>
             ${station.limitYn ? `<p class="charger-popup-warn">이용 제한: ${escapeHtml(station.limitDetail || "제한 있음")}</p>` : ""}
           </div>`
        );
        marker.on("click", () => setSelected(station.statId));
        marker.addTo(layerRef.current);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stations]);

  const focus = useCallback((station: Station) => {
    setSelected(station.statId);
    mapRef.current?.setView([station.lat, station.lng], 16);
  }, []);

  const counts = useMemo(() => {
    const free = stations.filter((entry) => entry.tone === "free").length;
    const chargers = stations.reduce((sum, entry) => sum + entry.usable.length, 0);
    return { stations: stations.length, free, chargers };
  }, [stations]);

  return (
    <div className="charge-map-board">
      <div className="charge-map-toolbar">
        <div className="charge-region-group" role="group" aria-label="지역 선택">
          {regionPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={preset.id === region.id ? "is-active" : ""}
              onClick={() => setRegion(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="charge-filter-group" role="group" aria-label="충전 속도">
          {(
            [
              { value: "all", label: "전체" },
              { value: "fast", label: "급속만" },
              { value: "slow", label: "완속만" }
            ] as Array<{ value: SpeedFilter; label: string }>
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              className={speed === option.value ? "is-active" : ""}
              onClick={() => setSpeed(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="charge-toggle">
          <input type="checkbox" checked={onlyUsable} onChange={(e) => setOnlyUsable(e.target.checked)} />
          내 차로 되는 것만
        </label>
        <label className="charge-toggle">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
          지금 비어 있는 곳만
        </label>

        <button className="tiny-button charge-refresh" type="button" onClick={() => void load(region)} title="새로고침">
          <RefreshCw size={14} aria-hidden="true" />
        </button>
      </div>

      {error ? (
        <div className="charge-alert" role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          <div>
            <strong>{error.error === "NO_KEY" ? "API 키가 아직 없다" : "충전소를 불러오지 못했다"}</strong>
            <p>{error.message}</p>
            {error.error === "NO_KEY" ? (
              <a
                className="ghost-button"
                href="https://www.data.go.kr/data/15076352/openapi.do"
                target="_blank"
                rel="noreferrer"
              >
                공공데이터포털에서 활용신청
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="charge-map-stats" aria-live="polite">
        {loading ? (
          <span className="charge-stat-loading">
            <Loader2 size={14} className="spin" aria-hidden="true" />
            불러오는 중…
          </span>
        ) : (
          <>
            <span>
              <strong>{counts.stations}</strong> 곳
            </span>
            <span>
              내 차 사용 가능 충전기 <strong>{counts.chargers}</strong>기
            </span>
            <span className="tone-free">
              지금 비어 있음 <strong>{counts.free}</strong>곳
            </span>
          </>
        )}
      </div>

      <div className="charge-map-layout">
        <div className="charge-map-canvas" ref={containerRef} role="application" aria-label="충전소 지도" />

        <div className="charge-station-list">
          {!loading && stations.length === 0 && !error ? (
            <p className="empty-note">조건에 맞는 충전소가 없다. 필터를 풀어본다.</p>
          ) : null}
          {stations.slice(0, 60).map(({ station, usable, tone }) => (
            <button
              key={station.statId}
              type="button"
              className={`charge-station-row${selected === station.statId ? " is-selected" : ""}`}
              onClick={() => focus(station)}
            >
              <span className={`charge-dot tone-${tone}`} aria-hidden="true" />
              <span className="charge-station-body">
                <strong>{station.statNm}</strong>
                <small>{station.addr}</small>
                <span className="charge-station-meta">
                  <em>{station.busiNm || "사업자 미상"}</em>
                  <em>
                    <Zap size={11} aria-hidden="true" />
                    {usable.length}기
                  </em>
                  <em>{[...new Set(usable.map((c) => chargerTypes[c.chgerType]?.short))].join(", ")}</em>
                </span>
              </span>
            </button>
          ))}
          {stations.length > 60 ? (
            <p className="empty-note">그 밖 {stations.length - 60}곳은 지도에서 확인.</p>
          ) : null}
        </div>
      </div>

      <div className="charge-legend">
        <span>
          <i className="tone-free" /> 충전 가능
        </span>
        <span>
          <i className="tone-busy" /> 사용 중
        </span>
        <span>
          <i className="tone-down" /> 이용 불가·미확인
        </span>
        <span className="charge-legend-note">
          <MapPin size={12} aria-hidden="true" />
          마커 안 숫자 = 내 차로 쓸 수 있는 충전기 수
        </span>
      </div>

      <p className="source-note">
        데이터 출처: 공공데이터포털{" "}
        <a href="https://www.data.go.kr/data/15076352/openapi.do" target="_blank" rel="noreferrer">
          한국환경공단_전기자동차 충전소 정보
        </a>{" "}
        (5분 캐시). 지도 타일은 OpenStreetMap. ★ 국내 슈퍼차저는 이 데이터셋에 들어오지 않는다 — 슈퍼차저는 Tesla
        앱이나 차량 내비에서 찾는 게 맞다. 상태값은 사업자가 올리는 값이라 실제 고장이 반영 안 될 때가 있다. 장거리
        전에는 EV Infra의 실사용 제보를 같이 보는 편이 안전하다.
      </p>
    </div>
  );
}
