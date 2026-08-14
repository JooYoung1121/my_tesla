"use client";

// 오너 허브 셸.
//
// 2026-08-14 인수 이후 범위를 4개로 좁혔다: 앱·연동 / 충전 / 준비물 / 커뮤니티.
// 인수 전 도구(카운트다운·일정·검수 체크리스트)와 참고성 자료(화면 사용법·정비·제원)는
// 통째로 걷어냈다. 복구가 필요하면 커밋 a4b6913 참고.

import { useState } from "react";
import { ExternalLink, Smartphone } from "lucide-react";
import { CoreAppsSection, RequiredFlowSection, ThirdPartySection } from "./AppsBoard";
import {
  ChargingAppsSection,
  ChargingMapSection,
  ConnectorSection,
  PaymentSection
} from "./ChargingBoard";
import { FeedBoard } from "./FeedBoard";
import { GearBoard } from "./GearBoard";

type ViewId = "apps" | "charging" | "gear" | "community";
type AppsTab = "list" | "required" | "thirdparty";
type ChargeTab = "map" | "connector" | "payment" | "apps";

const views: Array<{ id: ViewId; label: string; title: string; eyebrow: string; description: string }> = [
  {
    id: "apps",
    label: "앱·연동",
    title: "무엇을 깔고, 무엇에 무엇을 붙이는가",
    eyebrow: "Apps & Linking",
    description: "차를 쓰려면 반드시 해야 하는 연동과, 해도 되고 안 해도 되는 계정 연동을 나눈다."
  },
  {
    id: "charging",
    label: "충전",
    title: "어디서 · 무엇으로 · 어떻게 결제하나",
    eyebrow: "Charging",
    description: "생활권 충전소 지도부터. 국내 테슬라는 어댑터가 한 단계 더 붙는다는 게 핵심이다."
  },
  {
    id: "gear",
    label: "준비물",
    title: "운행에 실제로 필요한 것",
    eyebrow: "Gear",
    description: "없으면 곤란한 것부터. 나머지는 두세 달 타보고 결정한다."
  },
  {
    id: "community",
    label: "커뮤니티",
    title: "최신 소식과 검색할 곳",
    eyebrow: "Feed",
    description: "뉴스는 실시간으로 끌어오고, 자동 수집이 막힌 카페·포럼은 링크로 둔다."
  }
];

function Segmented<T extends string>({
  options,
  value,
  onChange
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented" role="tablist">
      {options.map((option) => (
        <button
          className={value === option.value ? "is-active" : ""}
          key={option.value}
          onClick={() => onChange(option.value)}
          role="tab"
          aria-selected={value === option.value}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function TeslaCommandCenter() {
  const [activeView, setActiveView] = useState<ViewId>("apps");
  const [appsTab, setAppsTab] = useState<AppsTab>("list");
  const [chargeTab, setChargeTab] = useState<ChargeTab>("map");
  const currentView = views.find((view) => view.id === activeView) ?? views[0];

  return (
    <main className="app-shell">
      <aside className="side-rail" aria-label="주요 메뉴">
        <button className="brand" onClick={() => setActiveView("apps")} type="button" aria-label="마이 테슬라 홈">
          <span className="brand-mark">Y</span>
          <span>
            <strong>마이 테슬라</strong>
            <small>Model Y RWD</small>
          </span>
        </button>

        <nav className="nav-list" aria-label="작업 공간">
          {views.map((view) => (
            <button
              className={activeView === view.id ? "is-active" : ""}
              key={view.id}
              onClick={() => setActiveView(view.id)}
              type="button"
            >
              {view.label}
            </button>
          ))}
        </nav>

        <div className="rail-note">
          <Smartphone size={16} aria-hidden="true" />
          <span>8/18 수령 · 오너 허브</span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{currentView.eyebrow}</p>
            <h1>{currentView.title}</h1>
            <p className="view-description">{currentView.description}</p>
          </div>
          <div className="topbar-actions" aria-label="빠른 동작">
            <a
              className="ghost-button"
              href="https://www.tesla.com/ko_kr/support/tesla-app"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={16} aria-hidden="true" />
              Tesla 앱
            </a>
          </div>
        </header>

        <div className="mobile-view-tabs" aria-label="작업 공간 빠른 전환">
          {views.map((view) => (
            <button
              className={activeView === view.id ? "is-active" : ""}
              key={view.id}
              onClick={() => setActiveView(view.id)}
              type="button"
            >
              {view.label}
            </button>
          ))}
        </div>

        <section className="tab-panel" aria-live="polite">
          {activeView === "apps" ? (
            <>
              <Segmented
                options={[
                  { value: "list", label: "필요한 앱" },
                  { value: "required", label: "필수 연동" },
                  { value: "thirdparty", label: "계정 연동" }
                ]}
                value={appsTab}
                onChange={setAppsTab}
              />
              {appsTab === "list" ? <CoreAppsSection /> : null}
              {appsTab === "required" ? <RequiredFlowSection /> : null}
              {appsTab === "thirdparty" ? <ThirdPartySection /> : null}
            </>
          ) : null}

          {activeView === "charging" ? (
            <>
              <Segmented
                options={[
                  { value: "map", label: "충전소 지도" },
                  { value: "connector", label: "충전기 종류" },
                  { value: "payment", label: "결제·등록" },
                  { value: "apps", label: "충전 앱" }
                ]}
                value={chargeTab}
                onChange={setChargeTab}
              />
              {chargeTab === "map" ? <ChargingMapSection /> : null}
              {chargeTab === "connector" ? <ConnectorSection /> : null}
              {chargeTab === "payment" ? <PaymentSection /> : null}
              {chargeTab === "apps" ? <ChargingAppsSection /> : null}
            </>
          ) : null}

          {activeView === "gear" ? (
            <section className="section-band">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">준비물</p>
                  <h2>용도가 설명 안 되는 물건은 사지 않는다</h2>
                </div>
                <a
                  className="ghost-button"
                  href="https://shop.tesla.com/ko_kr/category/vehicle-accessories"
                  target="_blank"
                  rel="noreferrer"
                >
                  테슬라 공식몰
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
              </div>
              <GearBoard />
            </section>
          ) : null}

          {activeView === "community" ? <FeedBoard /> : null}
        </section>

        <footer className="footer">
          <span>마이 테슬라</span>
          <a href="https://www.tesla.com/ko_kr/support/model-y" target="_blank" rel="noreferrer">
            오너 매뉴얼
          </a>
          <a href="https://www.ev.or.kr/" target="_blank" rel="noreferrer">
            무공해차 통합누리집
          </a>
        </footer>
      </section>
    </main>
  );
}
