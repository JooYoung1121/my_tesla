"use client";

import { useEffect, useMemo, useState } from "react";
import { subsidyConfig } from "@/data/home";

const STORE_KEY = "my-tesla-subsidy-v1";

type SubsidyState = {
  basePrice: number;
  gukbi: number;
  jibangbi: number;
  multiChild: number;
  youth: boolean;
  conversion: boolean;
  veteran: boolean;
  teslaSupport: boolean;
  referral: boolean;
};

const defaultState: SubsidyState = {
  basePrice: subsidyConfig.basePrice,
  gukbi: subsidyConfig.gukbi,
  jibangbi: subsidyConfig.jibangbi,
  multiChild: 0,
  youth: false,
  conversion: false,
  veteran: false,
  teslaSupport: false,
  referral: false
};

function loadState(): SubsidyState {
  if (typeof window === "undefined") return defaultState;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORE_KEY) ?? "{}");
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

function won(amount: number) {
  return `${amount.toLocaleString()}만 원`;
}

export function SubsidyCalculator() {
  const [state, setState] = useState<SubsidyState>(defaultState);

  useEffect(() => {
    setState(loadState());
  }, []);

  function update(next: Partial<SubsidyState>) {
    const merged = { ...state, ...next };
    setState(merged);
    window.localStorage.setItem(STORE_KEY, JSON.stringify(merged));
  }

  const calc = useMemo(() => {
    const base = state.gukbi + state.jibangbi;
    const youthAdd = state.youth ? Math.round(state.gukbi * 0.2) : 0;
    const multiAdd = subsidyConfig.multiChild.find((m) => m.value === state.multiChild)?.amount ?? 0;
    const conversionAdd = state.conversion ? (base >= 500 ? 100 : Math.round(base * 0.2)) : 0;
    const veteranAdd = state.veteran ? 100 : 0;
    const teslaAdd = state.teslaSupport ? 170 : 0;
    const referralDiscount = state.referral ? 33 : 0;

    const lines = [
      { label: "국비 보조금", amount: state.gukbi },
      { label: "지방비 보조금", amount: state.jibangbi },
      { label: "청년 첫 차 (국비 20%)", amount: youthAdd },
      { label: "다자녀", amount: multiAdd },
      { label: "내연차 전환", amount: conversionAdd },
      { label: "국가유공상이자", amount: veteranAdd },
      { label: "테슬라 자체 지원금", amount: teslaAdd },
      { label: "추천 할인 (차량가 직접)", amount: referralDiscount }
    ].filter((line) => line.amount > 0);

    const totalSubsidy = state.gukbi + state.jibangbi + youthAdd + multiAdd + conversionAdd + veteranAdd + teslaAdd;
    const netPrice = state.basePrice - referralDiscount - totalSubsidy;
    return { lines, totalSubsidy, referralDiscount, netPrice };
  }, [state]);

  return (
    <div className="subsidy">
      <div className="subsidy-inputs">
        <label>
          <span>차량가 (만원)</span>
          <input
            type="number"
            value={state.basePrice}
            onChange={(event) => update({ basePrice: Number(event.target.value) || 0 })}
          />
        </label>
        <label>
          <span>국비 보조금 (만원)</span>
          <input
            type="number"
            value={state.gukbi}
            onChange={(event) => update({ gukbi: Number(event.target.value) || 0 })}
          />
        </label>
        <label>
          <span>지방비 보조금 (만원)</span>
          <input
            type="number"
            value={state.jibangbi}
            onChange={(event) => update({ jibangbi: Number(event.target.value) || 0 })}
            placeholder="지역별 입력"
          />
        </label>
      </div>

      <div className="subsidy-multichild" role="group" aria-label="다자녀">
        <span>다자녀</span>
        <div>
          {subsidyConfig.multiChild.map((option) => (
            <button
              className={state.multiChild === option.value ? "is-active" : ""}
              key={option.value}
              onClick={() => update({ multiChild: option.value })}
              type="button"
            >
              {option.label}
              {option.amount > 0 ? <em>-{option.amount}만</em> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="subsidy-toggles">
        {subsidyConfig.options.map((option) => {
          const checked = state[option.id as keyof SubsidyState] as boolean;
          return (
            <label className={checked ? "subsidy-toggle is-on" : "subsidy-toggle"} key={option.id}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => update({ [option.id]: event.target.checked } as Partial<SubsidyState>)}
              />
              <span>
                <strong>{option.label}</strong>
                <small>{option.desc}</small>
              </span>
            </label>
          );
        })}
      </div>

      <div className="subsidy-result">
        <div className="subsidy-breakdown">
          <div className="subsidy-row subsidy-row-base">
            <span>차량가</span>
            <em>{won(state.basePrice)}</em>
          </div>
          {calc.lines.map((line) => (
            <div className="subsidy-row" key={line.label}>
              <span>{line.label}</span>
              <em>-{won(line.amount)}</em>
            </div>
          ))}
        </div>
        <div className="subsidy-total">
          <div>
            <span>총 보조·감면</span>
            <strong>{won(calc.totalSubsidy + calc.referralDiscount)}</strong>
          </div>
          <div className="subsidy-net">
            <span>예상 실구매가</span>
            <strong>{won(calc.netPrice)}</strong>
          </div>
        </div>
      </div>

      <p className="source-note">
        환경부 2026 보조금 지침 + 테슬라 공지 기준 추정. 비율 지원(청년 20%)을 먼저 산정한 뒤 정액
        지원을 더한다. 취득세 감면은 별도이며, 테슬라 자체 지원금은 보통 지방비 소진 지역에 한정된다.
        지방비·잔여 물량은 무공해차 통합누리집에서 확인한다.
      </p>
    </div>
  );
}
