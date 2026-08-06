"use client";

import { useEffect, useState } from "react";
import { Anchor, ChevronDown, ExternalLink, RefreshCw, Ship, ShieldCheck } from "lucide-react";
import { deliveryTrackers } from "@/data/home";
import type { ArrivalWindow, CandidateStrength, CandidateVessel } from "@/data/shipment";

type ApiResponse = {
  port: string;
  prtAgCd: string;
  range: { sde: string; ede: string }; // YYYYMMDD
  fetchedAt: string;
  window: ArrivalWindow;
  total: number;
  returned: number;
  candidates: CandidateVessel[];
};

type ApiError = { error: string; hint?: string };

const STRENGTH_META: Record<CandidateStrength, { label: string; desc: string }> = {
  high: { label: "가능성 높음", desc: "기가팩토리 출발항(최초·직전) 또는 테슬라 선대 + 해외 직행" },
  medium: { label: "가능성 중간", desc: "테슬라 선대(국내 연안 출발) 또는 자동차선 + 해외 직행" },
  low: { label: "참고", desc: "그 외 자동차운반선(국내 연안 위주)" }
};

// 선박명으로 항적을 교차 확인할 외부 AIS 서비스.
const VESSEL_SEARCH = [
  {
    name: "VesselFinder",
    url: (name: string) => `https://www.vesselfinder.com/vessels?name=${encodeURIComponent(name)}`
  },
  {
    name: "MarineTraffic",
    url: (name: string) =>
      `https://www.marinetraffic.com/en/ais/index/search/all/keyword:${encodeURIComponent(name)}`
  }
];

function ymdToISO(ymd: string) {
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function fmtDate(iso: string | null) {
  if (!iso) return "미정";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "미정";
  return `${d.getMonth() + 1}.${d.getDate()}(${WEEKDAYS[d.getDay()]})`;
}

function fmtTime(iso: string | null) {
  return iso && iso.length >= 16 ? iso.slice(11, 16) : null;
}

function fmtFetchedAt(iso: string) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Seoul"
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16).replace("T", " ");
  }
}

function dDayLabel(dDay: number | null) {
  if (dDay == null) return null;
  if (dDay === 0) return "오늘 입항";
  if (dDay < 0) return `${-dDay}일 전 입항`;
  return `D-${dDay}`;
}

// 조회 구간(range)을 0~100%로 놓고 날짜를 위치로 변환한다.
function makePercentScale(range: { sde: string; ede: string }) {
  const start = Date.parse(`${ymdToISO(range.sde)}T00:00:00`);
  const end = Date.parse(`${ymdToISO(range.ede)}T00:00:00`);
  const span = Math.max(end - start, 1);
  return (iso: string) => {
    const t = Date.parse(`${iso.slice(0, 10)}T00:00:00`);
    return Math.min(100, Math.max(0, ((t - start) / span) * 100));
  };
}

function ArrivalTimeline({ data }: { data: ApiResponse }) {
  const pct = makePercentScale(data.range);
  const todayISO = new Date().toISOString().slice(0, 10);
  const left = pct(data.window.from);
  const width = Math.max(pct(data.window.to) - left, 2);
  const dots = data.candidates.filter((v) => v.arrivalAt);

  return (
    <div className="ship-timeline" aria-label="조회 구간 입항 타임라인">
      <div className="ship-timeline-track">
        <span
          className="ship-timeline-window"
          style={{ left: `${left}%`, width: `${width}%` }}
          title={`내 차 예상 입항 구간 ${fmtDate(data.window.from)}~${fmtDate(data.window.to)}`}
        />
        <span
          className="ship-timeline-today"
          style={{ left: `${pct(todayISO)}%` }}
          aria-label="오늘"
        />
        {dots.map((v, i) => (
          <span
            key={`${v.shipName}-${i}`}
            className={`ship-timeline-dot dot-${v.strength}${v.inMyWindow ? " dot-mine" : ""}${v.dDay === 0 ? " dot-today" : ""}`}
            style={{ left: `${pct(v.arrivalAt!)}%` }}
            title={`${v.shipName} · ${fmtDate(v.arrivalAt)}`}
          />
        ))}
      </div>
      <div className="ship-timeline-axis">
        <span>{fmtDate(ymdToISO(data.range.sde))}</span>
        <span
          className="ship-timeline-today-label"
          style={{ left: `${pct(todayISO)}%` }}
        >
          오늘
        </span>
        <span>{fmtDate(ymdToISO(data.range.ede))}</span>
      </div>
    </div>
  );
}

function VesselCard({ v }: { v: CandidateVessel }) {
  const [open, setOpen] = useState(false);
  const meta = STRENGTH_META[v.strength];
  const time = fmtTime(v.arrivalAt);
  const facts = [
    v.vesselType,
    v.grossTon != null ? `${v.grossTon.toLocaleString()}t` : null,
    v.nationality,
    v.berth ? `접안 ${v.berth}` : null
  ].filter(Boolean);

  // 출항지 표기: 최초출항지(항차 시작점)와 직전출항지(평택 직전 항)를 구분한다.
  const firstPort = v.firstPort;
  const prevPort = v.prevPort && v.prevPort !== v.firstPort ? v.prevPort : null;

  const detailFields: [string, string | null][] = [
    ["호출부호", v.callSign],
    ["선종", v.vesselType],
    ["총톤수", v.grossTon != null ? `${v.grossTon.toLocaleString()}t` : null],
    ["국적", v.nationality],
    ["최초출항지", v.firstPort],
    ["직전출항지", v.prevPort],
    ["다음 기항지", v.toPort],
    ["입항일시", v.arrivalAt ? `${fmtDate(v.arrivalAt)}${time ? ` ${time}` : ""}` : null],
    ["출항(예정)", v.departureAt ? fmtDate(v.departureAt) : null],
    ["접안 선석", v.berth]
  ];

  return (
    <article className={`ship-card${v.inMyWindow ? " ship-card-mine" : ""}`}>
      <button
        type="button"
        className="ship-card-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title="누르면 판정 근거와 원본 신고 필드가 펼쳐진다"
      >
        <div className="ship-card-top">
          <span className="ship-name">
            <Ship size={16} aria-hidden="true" />
            {v.shipName}
            {v.callSign ? <small className="ship-callsign">{v.callSign}</small> : null}
          </span>
          <div className="ship-badges">
            {v.inMyWindow ? <span className="pill ship-pill-mine">내 차 후보</span> : null}
            <span className={`pill ship-strength ship-strength-${v.strength}`} title={meta.desc}>
              {meta.label}
            </span>
            <ChevronDown size={15} className="ship-card-chevron" aria-hidden="true" />
          </div>
        </div>
        <div className="ship-route">
          {firstPort ? (
            <span title="입항신고의 최초출항지 — 항차 시작점. 중간 기항지는 신고에 없다">
              {firstPort} <small className="ship-route-tag">최초</small>
            </span>
          ) : null}
          {prevPort ? (
            <>
              {firstPort ? <span aria-hidden="true">→</span> : null}
              <span title="입항신고의 직전출항지 — 평택 직전에 떠난 항">
                {prevPort} <small className="ship-route-tag">직전</small>
              </span>
            </>
          ) : null}
          {firstPort || prevPort ? <span aria-hidden="true">→</span> : null}
          <span className="ship-route-dest">
            <Anchor size={12} aria-hidden="true" /> 평택
          </span>
          <span className="ship-route-when">
            입항 {fmtDate(v.arrivalAt)}
            {time ? ` ${time}` : ""}
            {dDayLabel(v.dDay) ? <em className="ship-dday"> · {dDayLabel(v.dDay)}</em> : null}
          </span>
        </div>
      </button>
      {facts.length > 0 ? <p className="ship-facts">{facts.join(" · ")}</p> : null}
      {v.reasons.length > 0 ? (
        <p className="ship-reason">근거: {v.reasons.join(" · ")}</p>
      ) : null}
      {open ? (
        <div className="ship-detail">
          <div>
            <p className="ship-detail-label">판정 체크리스트</p>
            <ul className="ship-checks">
              {v.checks.map((c) => (
                <li key={c.label} className={`ship-check${c.hit ? " ship-check-hit" : ""}`}>
                  <i aria-hidden="true">{c.hit ? "✓" : "✗"}</i>
                  <span>
                    <strong>{c.label}</strong>
                    {c.detail ? ` — ${c.detail}` : ""}
                  </span>
                </li>
              ))}
            </ul>
            <p className="ship-detail-note">
              → 등급 &ldquo;{meta.label}&rdquo;: {meta.desc}
            </p>
          </div>
          <div>
            <p className="ship-detail-label">PORT-MIS 원본 신고 필드</p>
            <dl className="ship-fields">
              {detailFields.map(([label, value]) =>
                value ? (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ) : null
              )}
            </dl>
            <p className="ship-detail-note">
              출항지는 입항신고의 최초·직전출항지 필드다. 중간 기항(상하이 등) 여부는 신고에
              없으므로 실제 항적은 아래에서 선박명으로 교차 확인한다.
            </p>
          </div>
          <div className="ship-xlinks">
            {VESSEL_SEARCH.map((s) => (
              <a key={s.name} href={s.url(v.shipName)} target="_blank" rel="noreferrer">
                {s.name}에서 항적 확인
                <ExternalLink size={11} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function ShipmentTracker() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/port/arrivals", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json as ApiError);
        setData(null);
      } else {
        setData(json as ApiResponse);
      }
    } catch (err) {
      setError({ error: "추적 데이터를 불러오지 못했습니다.", hint: String(err) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const mine = data?.candidates.filter((v) => v.inMyWindow) ?? [];
  const others = data?.candidates.filter((v) => !v.inMyWindow) ?? [];

  return (
    <section className="section-band ship-tracker">
      <div className="ship-tracker-head">
        <div className="mini-heading">
          <p className="eyebrow">입항 실시간 추적</p>
          <h3>평택항 테슬라 후보 선박</h3>
        </div>
        <div className="ship-head-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={15} aria-hidden="true" className={loading ? "spin" : undefined} />
            새로고침
          </button>
        </div>
      </div>

      {data ? (
        <div className="ship-provenance">
          <span className="ship-provenance-badge">
            <ShieldCheck size={13} aria-hidden="true" />
            해양수산부 PORT-MIS 공공데이터
          </span>
          <span>
            조회 {fmtDate(ymdToISO(data.range.sde))}~{fmtDate(ymdToISO(data.range.ede))} · 전체
            입항 {data.total}척 중 후보 {data.returned}척 · 갱신 {fmtFetchedAt(data.fetchedAt)}
          </span>
          <a
            href="https://www.data.go.kr/data/15006353/openapi.do"
            target="_blank"
            rel="noreferrer"
          >
            원본 API
            <ExternalLink size={12} aria-hidden="true" />
          </a>
        </div>
      ) : null}

      {data?.window ? (
        <div className="ship-window">
          <span className="pill">내 차 예상 입항 구간</span>
          <strong>
            {fmtDate(data.window.from)} ~ {fmtDate(data.window.to)}
          </strong>
          <span className="ship-window-sub">
            중앙값 {fmtDate(data.window.mid)} · 계약 {fmtDate(data.window.contractDate)} +{" "}
            {data.window.cohortLabel} 리드타임({data.window.trimLabel}) − 통관·탁송 여유
          </span>
        </div>
      ) : null}

      {data && data.candidates.length > 0 ? <ArrivalTimeline data={data} /> : null}

      {data ? (
        <div className="ship-legend" aria-label="후보 판정 기준">
          {(Object.keys(STRENGTH_META) as CandidateStrength[]).map((s) => (
            <span key={s}>
              <i className={`ship-legend-dot dot-${s}`} aria-hidden="true" />
              <strong>{STRENGTH_META[s].label}</strong> {STRENGTH_META[s].desc}
            </span>
          ))}
          <span className="ship-legend-hint">
            카드를 누르면 판정 근거·원본 신고 필드·항적 링크가 펼쳐진다
          </span>
        </div>
      ) : null}

      {loading ? <p className="source-note">입항 데이터를 불러오는 중…</p> : null}

      {error ? (
        <div className="ship-empty">
          <p>{error.error}</p>
          {error.hint ? <p className="source-note">{error.hint}</p> : null}
        </div>
      ) : null}

      {data && data.candidates.length === 0 && !loading ? (
        <p className="source-note">
          현재 조회 구간에 테슬라 후보 선박이 없습니다. (전체 입항 {data.total}척 중 0건)
        </p>
      ) : null}

      {data && !loading && mine.length === 0 && data.candidates.length > 0 ? (
        <p className="source-note">
          내 예상 구간({fmtDate(data.window.from)}~{fmtDate(data.window.to)})에 신고된 배는
          아직 없다. PORT-MIS 입항 신고는 보통 입항 며칠 전에 올라오므로, 구간이 가까워지면
          이 목록에 &ldquo;내 차 후보&rdquo;가 나타난다.
        </p>
      ) : null}

      {mine.length > 0 ? (
        <div className="ship-group">
          <div className="ship-group-title">
            <strong>내 입항 구간과 겹치는 배</strong>
            <span>{mine.length}척</span>
          </div>
          <div className="ship-list">
            {mine.map((v, i) => (
              <VesselCard key={`${v.shipName}-${v.arrivalAt}-${i}`} v={v} />
            ))}
          </div>
        </div>
      ) : null}

      {others.length > 0 ? (
        <div className="ship-group">
          <div className="ship-group-title">
            <strong>그 외 자동차운반선</strong>
            <span>{others.length}척</span>
          </div>
          <div className="ship-list">
            {others.map((v, i) => (
              <VesselCard key={`${v.shipName}-${v.arrivalAt}-${i}`} v={v} />
            ))}
          </div>
        </div>
      ) : null}

      <p className="source-note">
        입항 스케줄은 해수부 PORT-MIS 선박운항정보(공공데이터포털 #15006353)를 30분 캐시로
        조회한 값이라 선박·일시는 공식 신고 데이터다. 다만 &ldquo;어느 배에 어떤 모델이 몇 대
        실렸는지&rdquo;는 공개 API에 없어 후보 판정(선대명·출발항·선종)은 이 사이트의 추정이다.
        모델별 적재 대수는 아래 제보 기반 외부 트래커에서 교차 확인한다.
      </p>

      <div className="tracker-list">
        {deliveryTrackers.map((tracker) => (
          <a
            className="tracker-row"
            href={tracker.url}
            key={tracker.url}
            target="_blank"
            rel="noreferrer"
          >
            <div>
              <strong>{tracker.name}</strong>
              <span>{tracker.detail}</span>
              <small className="tracker-method">{tracker.method}</small>
            </div>
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}
