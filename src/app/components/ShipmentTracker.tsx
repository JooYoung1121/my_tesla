"use client";

import { useEffect, useState } from "react";
import { Anchor, ExternalLink, RefreshCw, Ship } from "lucide-react";
import { deliveryTrackers } from "@/data/home";
import type { ArrivalWindow, CandidateVessel } from "@/data/shipment";

type ApiResponse = {
  port: string;
  fetchedAt: string;
  window: ArrivalWindow;
  total: number;
  returned: number;
  candidates: CandidateVessel[];
};

type ApiError = { error: string; hint?: string };

function fmtDate(iso: string | null) {
  if (!iso) return "미정";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${Number(m)}.${Number(d)}`;
}

function dDayLabel(dDay: number | null) {
  if (dDay == null) return null;
  if (dDay === 0) return "오늘 입항";
  if (dDay < 0) return `${-dDay}일 전 입항`;
  return `D-${dDay}`;
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

  return (
    <section className="section-band ship-tracker">
      <div className="ship-tracker-head">
        <div className="mini-heading">
          <p className="eyebrow">입항 실시간 추적</p>
          <h3>평택항 테슬라 후보 선박</h3>
        </div>
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

      {data?.window ? (
        <div className="ship-window">
          <span className="pill">내 차 예상 입항 구간</span>
          <strong>
            {fmtDate(data.window.from)} ~ {fmtDate(data.window.to)}
          </strong>
          <span className="ship-window-sub">
            중앙값 {fmtDate(data.window.mid)} · {data.window.trimLabel} ·{" "}
            {data.window.cohortLabel} 리드타임 기준 추정
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

      {data && data.candidates.length > 0 ? (
        <div className="ship-list">
          {data.candidates.map((v, i) => (
            <article
              key={`${v.shipName}-${v.arrivalAt}-${i}`}
              className={`ship-card${v.inMyWindow ? " ship-card-mine" : ""}`}
            >
              <div className="ship-card-top">
                <span className="ship-name">
                  <Ship size={16} aria-hidden="true" />
                  {v.shipName}
                </span>
                <div className="ship-badges">
                  {v.inMyWindow ? <span className="pill ship-pill-mine">내 차 후보</span> : null}
                  {dDayLabel(v.dDay) ? <span className="ship-dday">{dDayLabel(v.dDay)}</span> : null}
                </div>
              </div>
              <div className="ship-route">
                {v.fromPort ? <span>{v.fromPort}</span> : null}
                {v.fromPort ? <span aria-hidden="true">→</span> : null}
                <span className="ship-route-dest">
                  <Anchor size={12} aria-hidden="true" /> 평택 {v.berth ?? ""}
                </span>
                <span className="ship-route-when">입항 {fmtDate(v.arrivalAt)}</span>
              </div>
              {v.reasons.length > 0 ? (
                <p className="ship-reason">{v.reasons.join(" · ")}</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      <p className="source-note">
        입항 스케줄은 PORT-MIS 선박운항정보(해수부) 실시간 데이터다. 후보 판정은 선사·출발항
        기준 추정이며, 모델별 적재 대수는 공개 API에 없어 표시하지 않는다. 정확한 모델 구성은
        아래 외부 트래커(제보 기반)를 참고.
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
            </div>
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}
