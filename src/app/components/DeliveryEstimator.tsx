"use client";

import { CalendarClock, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { deliveryLeadStats, myOrder, pickLeadStat } from "@/data/home";

export const DELIVERY_STORE_KEY = "my-tesla-delivery-v1";

type DeliveryInput = {
  trim: string;
  contractDate: string;
};

function loadInput(): DeliveryInput {
  if (typeof window === "undefined") return { trim: myOrder.trim, contractDate: myOrder.contractDate };
  try {
    const raw = window.localStorage.getItem(DELIVERY_STORE_KEY);
    if (!raw) return { trim: myOrder.trim, contractDate: myOrder.contractDate };
    const parsed = JSON.parse(raw);
    return {
      trim: parsed.trim ?? myOrder.trim,
      contractDate: parsed.contractDate ?? myOrder.contractDate
    };
  } catch {
    return { trim: myOrder.trim, contractDate: myOrder.contractDate };
  }
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

export function DeliveryEstimator() {
  const [input, setInput] = useState<DeliveryInput>({
    trim: myOrder.trim,
    contractDate: myOrder.contractDate
  });

  useEffect(() => {
    setInput(loadInput());
  }, []);

  function update(next: DeliveryInput) {
    setInput(next);
    window.localStorage.setItem(DELIVERY_STORE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("my-tesla-delivery-change"));
  }

  const lead = useMemo(() => pickLeadStat(input.trim), [input.trim]);

  const result = useMemo(() => {
    if (!input.contractDate) return null;
    const base = new Date(`${input.contractDate}T00:00:00+09:00`);
    if (Number.isNaN(base.getTime())) return null;
    const expected = addDays(base, lead.median);
    const earliest = addDays(base, lead.p25);
    const latest = addDays(base, lead.p75);
    const dday = Math.ceil((expected.getTime() - Date.now()) / 86_400_000);
    return { expected, earliest, latest, dday };
  }, [input.contractDate, lead]);

  return (
    <div className="estimator">
      <div className="estimator-form">
        <label>
          <span>트림</span>
          <select
            value={input.trim}
            onChange={(event) => update({ ...input, trim: event.target.value })}
          >
            {deliveryLeadStats.trims.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>계약일</span>
          <input
            type="date"
            value={input.contractDate}
            onChange={(event) => update({ ...input, contractDate: event.target.value })}
          />
        </label>
        {input.contractDate ? (
          <button
            className="ghost-button"
            onClick={() => update({ ...input, contractDate: "" })}
            type="button"
          >
            <RotateCcw size={14} aria-hidden="true" />
            초기화
          </button>
        ) : null}
      </div>

      {result ? (
        <div className="estimator-result">
          <div className="estimator-main">
            <CalendarClock size={20} aria-hidden="true" />
            <div>
              <span>예상 인도 {result.dday > 0 ? `(D-${result.dday})` : "(예상일 경과)"}</span>
              <strong>{formatDate(result.expected)}</strong>
            </div>
          </div>
          <div className="estimator-range">
            <div>
              <span>빠르면 (상위 25%)</span>
              <strong>{formatDate(result.earliest)}</strong>
            </div>
            <div>
              <span>늦으면 (하위 25%)</span>
              <strong>{formatDate(result.latest)}</strong>
            </div>
          </div>
        </div>
      ) : (
        <p className="estimator-empty">계약일을 입력하면 예상 인도일과 D-day가 계산된다.</p>
      )}

      <p className="source-note">
        {lead.trimLabel} · {lead.cohortLabel} {lead.count.toLocaleString()}건 기준 · 중앙값{" "}
        {lead.median}일(빠르면 {lead.p25}일, 늦으면 {lead.p75}일).{" "}
        {lead.basis === "recent"
          ? `최근 인도 추세를 반영했다(전체 중앙값은 ${lead.allTimeMedian}일). 다만 최근 계약은 느린 건이 아직 인도되지 않아 다소 짧게 보일 수 있다.`
          : "최근 표본이 적어 2025년 이후 전체 통계를 쓴다."}{" "}
        출처: {deliveryLeadStats.source}({deliveryLeadStats.collectedAt} 수집).
        {lead.lowSample ? " 표본이 적어 참고용이다." : ""}
      </p>
    </div>
  );
}
