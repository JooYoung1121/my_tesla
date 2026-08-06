"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Check,
  CircleDot,
  Database,
  ExternalLink,
  KeyRound,
  MonitorSmartphone,
  Package,
  Smartphone,
  Star,
  Truck,
  Wrench
} from "lucide-react";
import {
  appGroups,
  deliveryFacts,
  FACT_SLUG,
  gearItems,
  KIND_SLUG,
  logGuides,
  maintenanceRows,
  ownerChecklist,
  ownerCostBuckets,
  ownership,
  quickLinks,
  scheduleSeed,
  specs
} from "@/data/ownership";
import { AppsBoard } from "./AppsBoard";
import { ChecklistManager } from "./ChecklistManager";
import { DataPolicyBoard } from "./DataPolicyBoard";
import { DisplayGuide } from "./DisplayGuide";
import { GearBoard } from "./GearBoard";
import { PersonalNotes } from "./PersonalNotes";
import { ScheduleBoard, SCHEDULE_STORE_KEY } from "./ScheduleBoard";

type ViewId = "today" | "schedule" | "checklist" | "car" | "gear" | "log";
type CarTab = "display" | "data" | "care";
type GearTab = "items" | "apps";

const OWNER_CHECKLIST_STORE_KEY = "my-tesla-owner-checklist-v1";
const OWNER_CHECKLIST_EVENT = "my-tesla-owner-checklist-change";

const views: Array<{
  id: ViewId;
  label: string;
  title: string;
  eyebrow: string;
  description: string;
}> = [
  {
    id: "today",
    label: "오늘",
    title: "인수까지 남은 것과 오늘 할 것",
    eyebrow: "Delivery Cockpit",
    description: "8/14 인수 후 틴팅업체로 탁송, 8/18에 업체에서 직접 수령. 두 날짜를 같이 본다."
  },
  {
    id: "schedule",
    label: "일정",
    title: "인수 · 시공 · 수령 캘린더",
    eyebrow: "Schedule",
    description: "확정 일정과 할 일을 날짜에 붙이고, 캘린더 앱으로 내보낸다."
  },
  {
    id: "checklist",
    label: "할 일",
    title: "인수 · 탁송 · 수령 · 첫 달",
    eyebrow: "Checklist",
    description: "8/14는 서류와 계정, 8/18은 검수. 두 날의 할 일이 다르다. 현장에서 그대로 열어 쓴다."
  },
  {
    id: "car",
    label: "차량",
    title: "화면 조작 · 데이터 · 정비",
    eyebrow: "Vehicle",
    description: "물리 버튼이 거의 없는 차다. 화면 어디에 뭐가 있는지와 내 데이터가 어디 쌓이는지를 본다."
  },
  {
    id: "gear",
    label: "장비",
    title: "무엇을 왜 사고, 무엇을 깔 것인가",
    eyebrow: "Gear & Apps",
    description: "용품은 용도와 실패 위험 중심으로, 앱은 언제 필요한지 기준으로 정리한다."
  },
  {
    id: "log",
    label: "기록",
    title: "직접 남기는 기록",
    eyebrow: "Log",
    description: "서드파티 데이터 로거를 붙이지 않기로 했으니, 충전·정비·하자는 여기에 직접 적는다."
  }
];

// ── 인수 상태 계산 ─────────────────────────────────────────────────────
// 인수(8/14)와 실제 수령(8/18)이 다르다. 그 사이 4일은 차가 틴팅업체에 있다.
// 그래서 카운트다운의 기준점이 단계에 따라 바뀐다:
//   인수 전 → 8/14까지, 시공 중 → 8/18까지, 수령 후 → 8/18로부터 경과일.
type OwnerStage = "인수 전" | "인수·탁송" | "시공 중" | "수령일" | "첫 주" | "첫 달" | "오너";

type OwnerStatus = {
  stage: OwnerStage;
  ddayLabel: string;
  ddayCaption: string;
  subLine: string | null;
  progress: number;
};

const STAGE_MARKS: Array<{ label: string; pos: number }> = [
  { label: "계약", pos: 0 },
  { label: "인수", pos: 34 },
  { label: "수령", pos: 52 },
  { label: "첫 주", pos: 70 },
  { label: "첫 달", pos: 100 }
];

const HERO_PREFIX: Record<OwnerStage, string> = {
  "인수 전": "인수까지 ",
  "인수·탁송": "인수 ",
  "시공 중": "수령까지 ",
  수령일: "",
  "첫 주": "수령 후 ",
  "첫 달": "수령 후 ",
  오너: "수령 후 "
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function fmtDay(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getMonth() + 1}.${d.getDate()}(${WEEKDAYS[d.getDay()]})`;
}

function daysUntil(todayMs: number, iso: string) {
  return Math.round((new Date(`${iso}T00:00:00`).getTime() - todayMs) / 86_400_000);
}

function useOwnerStatus(): OwnerStatus | null {
  const [status, setStatus] = useState<OwnerStatus | null>(null);

  useEffect(() => {
    const now = new Date();
    const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const toDelivery = daysUntil(todayMs, ownership.deliveryDate);
    const toHandover = daysUntil(todayMs, ownership.handoverDate);
    const sinceHandover = -toHandover;

    const contractMs = new Date(`${ownership.contractDate}T00:00:00`).getTime();
    const deliveryMs = new Date(`${ownership.deliveryDate}T00:00:00`).getTime();
    const handoverMs = new Date(`${ownership.handoverDate}T00:00:00`).getTime();

    let stage: OwnerStage;
    let ddayLabel: string;
    let ddayCaption: string;
    let subLine: string | null = null;
    let progress: number;

    if (toDelivery > 0) {
      stage = "인수 전";
      ddayLabel = `D-${toDelivery}`;
      ddayCaption = `${fmtDay(ownership.deliveryDate)} 인수 · 업체로 탁송`;
      subLine = `내 손에 오는 건 ${fmtDay(ownership.handoverDate)} — D-${toHandover}`;
      const span = (deliveryMs - contractMs) / 86_400_000;
      progress = Math.min(Math.max(((todayMs - contractMs) / 86_400_000 / span) * 34, 0), 34);
    } else if (toDelivery === 0) {
      stage = "인수·탁송";
      ddayLabel = "D-DAY";
      ddayCaption = "오늘 인수 후 틴팅업체로 탁송";
      subLine = `수령까지 D-${toHandover}`;
      progress = 34;
    } else if (toHandover > 0) {
      stage = "시공 중";
      ddayLabel = `D-${toHandover}`;
      ddayCaption = "틴팅·PPF 시공 중 · 업체에서 수령까지";
      subLine = `${fmtDay(ownership.deliveryDate)} 인수 완료 · 차는 업체 보관 중`;
      const span = (handoverMs - deliveryMs) / 86_400_000;
      progress = 34 + Math.min(Math.max(((todayMs - deliveryMs) / 86_400_000 / span) * 18, 0), 18);
    } else if (toHandover === 0) {
      stage = "수령일";
      ddayLabel = "수령";
      ddayCaption = "오늘 업체에서 차량 수령";
      subLine = "떠나기 전에 시공 검수를 끝낼 것";
      progress = 52;
    } else {
      stage = sinceHandover <= 7 ? "첫 주" : sinceHandover <= ownership.firstMonthDays ? "첫 달" : "오너";
      ddayLabel = `D+${sinceHandover}`;
      ddayCaption = `${fmtDay(ownership.handoverDate)} 수령 기준`;
      progress = Math.min(52 + (sinceHandover / ownership.firstMonthDays) * 48, 100);
    }

    setStatus({ stage, ddayLabel, ddayCaption, subLine, progress });
  }, []);

  return status;
}

function useOwnerReadiness() {
  const [readiness, setReadiness] = useState<{ done: number; total: number; percent: number } | null>(
    null
  );

  useEffect(() => {
    function compute() {
      let states: Record<string, { done: boolean }> = {};
      let customItems: Array<{ done: boolean }> = [];
      try {
        const parsed = JSON.parse(window.localStorage.getItem(OWNER_CHECKLIST_STORE_KEY) ?? "{}");
        states = parsed.states ?? {};
        customItems = Array.isArray(parsed.customItems) ? parsed.customItems : [];
      } catch {
        // 저장된 상태가 없으면 기본 상태로 계산한다.
      }

      const defaults = ownerChecklist.flatMap((group) =>
        group.items.map((item) => {
          const stored = states[`${group.phase}::${item.text}`];
          return stored?.done ?? item.status === "완료";
        })
      );
      const all = [...defaults, ...customItems.map((item) => item.done)];
      const done = all.filter(Boolean).length;
      setReadiness({
        done,
        total: all.length,
        percent: all.length ? Math.round((done / all.length) * 100) : 0
      });
    }

    compute();
    window.addEventListener(OWNER_CHECKLIST_EVENT, compute);
    return () => window.removeEventListener(OWNER_CHECKLIST_EVENT, compute);
  }, []);

  return readiness;
}

type StoredEvent = {
  id: string;
  date: string | null;
  title: string;
  kind: string;
  note: string;
  done?: boolean;
};
type UpcomingEvent = StoredEvent & { date: string };

function useUpcoming(limit: number) {
  const [items, setItems] = useState<UpcomingEvent[] | null>(null);

  useEffect(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;

    let events: StoredEvent[] = scheduleSeed;
    try {
      const raw = window.localStorage.getItem(SCHEDULE_STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.events)) events = parsed.events as StoredEvent[];
      }
    } catch {
      // 저장값이 깨졌으면 시드 일정을 쓴다.
    }

    setItems(
      events
        .filter((event): event is UpcomingEvent => Boolean(event.date) && !event.done)
        .filter((event) => event.date >= today)
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .slice(0, limit)
    );
  }, [limit]);

  return items;
}

// 시그니처 요소: 계약 → 인수 → 수령 → 첫 달을 하나의 계기 스트립으로 그린다.
function OwnershipStrip({ status }: { status: OwnerStatus }) {
  return (
    <div className="voyage" aria-label="인수 진행 위치">
      <div className="voyage-track">
        <span className="voyage-fill" style={{ width: `${status.progress}%` }} />
        {STAGE_MARKS.map((mark) => (
          <span
            key={mark.label}
            className={`voyage-tick${status.progress >= mark.pos ? " is-passed" : ""}`}
            style={{ left: `${mark.pos}%` }}
          />
        ))}
        <span className="voyage-marker" style={{ left: `${status.progress}%` }} title="현재 위치" />
      </div>
      <div className="voyage-labels">
        {STAGE_MARKS.map((mark) => (
          <span
            key={mark.label}
            className={status.progress >= mark.pos ? "is-passed" : ""}
            style={{ left: `${mark.pos}%` }}
          >
            {mark.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

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
  const [activeView, setActiveView] = useState<ViewId>("today");
  const [carTab, setCarTab] = useState<CarTab>("display");
  const [gearTab, setGearTab] = useState<GearTab>("items");
  const currentView = views.find((view) => view.id === activeView) ?? views[0];

  function goTo(view: ViewId, segment?: CarTab | GearTab) {
    if (view === "car" && segment) setCarTab(segment as CarTab);
    if (view === "gear" && segment) setGearTab(segment as GearTab);
    setActiveView(view);
  }

  return (
    <main className="app-shell">
      <aside className="side-rail" aria-label="주요 메뉴">
        <button
          className="brand"
          onClick={() => setActiveView("today")}
          type="button"
          aria-label="마이 테슬라 홈"
        >
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
          <Database size={16} aria-hidden="true" />
          <span>개인용 오너 허브</span>
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
            <button className="primary-button" onClick={() => setActiveView("log")} type="button">
              <Bookmark size={16} aria-hidden="true" />
              기록
            </button>
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
          {activeView === "today" ? <TodayView goTo={goTo} /> : null}
          {activeView === "schedule" ? <ScheduleView /> : null}
          {activeView === "checklist" ? <ChecklistView /> : null}
          {activeView === "car" ? <CarView tab={carTab} setTab={setCarTab} /> : null}
          {activeView === "gear" ? <GearView tab={gearTab} setTab={setGearTab} /> : null}
          {activeView === "log" ? <LogView /> : null}
        </section>

        <footer className="footer">
          <span>마이 테슬라</span>
          <a href="https://www.tesla.com/ko_kr/support/model-y" target="_blank" rel="noreferrer">
            오너 매뉴얼
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <a href="https://cafe.naver.com/noljatravel" target="_blank" rel="noreferrer">
            TKC 카페
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <span className="footer-star">
            <Star size={14} aria-hidden="true" />
            8/14 인수 · 8/18 수령
          </span>
        </footer>
      </section>
    </main>
  );
}

// ── 오늘 ───────────────────────────────────────────────────────────────
function TodayView({ goTo }: { goTo: (view: ViewId, segment?: CarTab | GearTab) => void }) {
  const status = useOwnerStatus();
  const readiness = useOwnerReadiness();
  const upcoming = useUpcoming(6);

  const mustGear = gearItems.filter((item) => item.priority === "필수").length;
  const coreApps = appGroups.find((group) => group.id === "core")?.items.length ?? 0;

  return (
    <section className="bento-grid" aria-label="오늘의 콕핏">
      <article className="bento-hero">
        <img src="/tesla-charging.jpg" alt="충전 중인 테슬라 실내 디스플레이" />
        <div className="bento-hero-overlay" aria-hidden="true" />
        <div className="bento-hero-content">
          <p className="hero-kicker">
            {ownership.model} · {ownership.generation}
          </p>
          <h2>
            {status ? HERO_PREFIX[status.stage] : "인수까지 "}
            <span className="dday">{status ? status.ddayLabel : "D-?"}</span>
          </h2>
          <p>
            {status ? status.ddayCaption : `${ownership.deliveryDate.replaceAll("-", ".")} 인수`}
            {status ? ` · 현재 단계 ${status.stage}` : ""}
          </p>
          {status?.subLine ? <p className="hero-subline">{status.subLine}</p> : null}
          {status ? <OwnershipStrip status={status} /> : null}
          <div className="hero-chips">
            <span>
              <KeyRound size={13} aria-hidden="true" />
              계약 {ownership.contractDate.replaceAll("-", ".")}
            </span>
            <span>{ownership.price}</span>
            <span>보험 가입 완료</span>
            <span>틴팅·PPF 시공 확정</span>
          </div>
        </div>
      </article>

      <div className="bento-side">
        <article className="bento-tile bento-ready">
          <span>할 일 진행률</span>
          <strong>
            {readiness ? readiness.percent : 0}
            <em>%</em>
          </strong>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${readiness?.percent ?? 0}%` }} />
          </div>
          <small>
            {readiness
              ? `${readiness.total}개 중 ${readiness.done}개 완료. 할 일 탭에서 갱신된다.`
              : "오너 체크리스트 기준으로 계산한다."}
          </small>
        </article>

        <div className="bento-mini-grid">
          <article className="bento-tile bento-mini">
            <span>필수 용품</span>
            <strong>{mustGear}종</strong>
            <small>알리 배송 2~4주. 선쉐이드는 지금 주문해야 이번 여름에 쓴다</small>
          </article>
          <article className="bento-tile bento-mini">
            <span>인수 당일 필수 앱</span>
            <strong>{coreApps}개</strong>
            <small>Tesla 공식 앱 · 하이패스 등록</small>
          </article>
        </div>
      </div>

      <article className="bento-tile today-facts">
        <div className="today-facts-head">
          <CircleDot size={17} aria-hidden="true" />
          <strong>인수 전 처리 상태</strong>
        </div>
        <div className="fact-list">
          {deliveryFacts.map((fact) => (
            <div className={`fact-row state-${FACT_SLUG[fact.state]}`} key={fact.label}>
              <span className={`fact-badge state-${FACT_SLUG[fact.state]}`}>{fact.state}</span>
              <div>
                <strong>{fact.label}</strong>
                <p>{fact.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="bento-tile today-upcoming">
        <div className="today-facts-head">
          <CalendarDays size={17} aria-hidden="true" />
          <strong>다가오는 일정</strong>
          <button className="tiny-button" type="button" onClick={() => goTo("schedule")}>
            캘린더
          </button>
        </div>
        {upcoming === null ? <p className="empty-note">불러오는 중…</p> : null}
        {upcoming && upcoming.length === 0 ? (
          <p className="empty-note">남은 일정이 없다. 일정 탭에서 추가한다.</p>
        ) : null}
        <div className="upcoming-list">
          {(upcoming ?? []).map((event) => (
            <div
              className={`upcoming-row kind-${KIND_SLUG[event.kind as keyof typeof KIND_SLUG] ?? "todo"}`}
              key={event.id}
            >
              <span className="upcoming-date">{fmtDay(event.date)}</span>
              <div>
                <strong>{event.title}</strong>
                {event.note ? <p>{event.note}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className="bento-tile bento-actions" aria-label="빠른 작업">
        <button onClick={() => goTo("checklist")} type="button">
          <Check size={19} aria-hidden="true" />
          <strong>수령일 검수</strong>
          <span>8/18 업체에서 틴팅·PPF 시공과 차량을 한 번에 검수하는 순서.</span>
        </button>
        <button onClick={() => goTo("car", "display")} type="button">
          <MonitorSmartphone size={19} aria-hidden="true" />
          <strong>화면 사용법</strong>
          <span>물리 버튼이 거의 없다. 기어·글로브박스·센트리가 화면 어디 있는지.</span>
        </button>
        <button onClick={() => goTo("gear", "items")} type="button">
          <Package size={19} aria-hidden="true" />
          <strong>용품 정하기</strong>
          <span>무엇을 왜 사는지, 안 사면 뭐가 문제인지부터 본다.</span>
        </button>
        <button onClick={() => goTo("gear", "apps")} type="button">
          <Smartphone size={19} aria-hidden="true" />
          <strong>앱 준비</strong>
          <span>인수 당일 필요한 것과 충전 시작할 때 깔 것을 나눈다.</span>
        </button>
      </div>
    </section>
  );
}

// ── 일정 ───────────────────────────────────────────────────────────────
const ownershipFlow = [
  {
    icon: AlertCircle,
    phase: "잔금·서류·사양 확인 (8/11 ~ 8/13)",
    detail:
      "앱에 최종 결제 금액이 뜨면 결제하고, 보험 개시일과 증권상 VIN을 배정 차량과 대조한다. 업체에는 두 가지를 요청해 둔다 — 시공 사양 목록(필름 제품명·창별 농도·PPF 부위)과 입고 직후·시공 전 상태 사진.",
    timing: "인수 며칠 전"
  },
  {
    icon: KeyRound,
    phase: "인수 (8/14 금)",
    detail:
      "서류상 인수일. 차는 여기서 바로 틴팅업체로 넘어가므로 이날 할 일은 검수가 아니라 결제·서류·Tesla 앱 연결·키카드 수령이다. 다만 유리 흠집과 도장 하자만은 필름이 올라가기 전인 지금이 마지막으로 볼 수 있는 시점이다.",
    timing: "D-DAY"
  },
  {
    icon: Truck,
    phase: "탁송·시공 (8/14 ~ 8/17)",
    detail:
      "틴팅과 PPF를 한 패키지로 같이 진행한다. 차량은 업체 보관이고 내가 할 일은 없지만 Tesla 앱으로 위치와 상태를 원격으로 볼 수 있다. 이 기간에 알리 배송분이 도착하면 수령 직후 바로 장착할 수 있다.",
    timing: "4일"
  },
  {
    icon: KeyRound,
    phase: "차량 수령 (8/18 화)",
    detail:
      "업체로 가서 직접 받는다. 미리 받아둔 시공 사양 목록을 기준표로 놓고 틴팅(기포·재단·열선)과 PPF(부위 누락·엣지 들뜸·이물질), 차량 전체 검수를 한 번에 끝낸다. 마당을 떠나고 나면 재작업 요구가 급격히 어려워진다.",
    timing: "실제 운행 시작"
  },
  {
    icon: Package,
    phase: "장착·적응 (첫 주)",
    detail:
      "스크린 보호필름, 매트, 선쉐이드, 하이패스 단말, 센트리용 USB를 몰아서 장착한다. 창문은 시공 경화가 끝나는 8/22까지 내리지 않는다.",
    timing: "8/18 ~ 8/25"
  },
  {
    icon: Wrench,
    phase: "판단 (첫 달)",
    detail:
      "충전 루틴과 실주행 효율의 기준선을 잡는다. 블랙박스 추가와 PPF 범위 확대는 이 기간의 실사용 결과로 판단한다. 기록은 기록 탭에 직접 남긴다.",
    timing: "수령 +30일"
  }
];

function ScheduleView() {
  return (
    <>
      <section className="section-band">
        <ScheduleBoard />
      </section>

      <section className="section-band">
        <SectionHeader eyebrow="인수 흐름" title="인수일 전후에 무슨 일이 순서대로 생기는가" />
        <ol className="process-timeline">
          {ownershipFlow.map((step, index) => {
            const Icon = step.icon;
            return (
              <li className="process-step" key={step.phase}>
                <span className="process-rail" aria-hidden="true">
                  <span className="process-dot">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                </span>
                <div className="process-body">
                  <div className="process-head">
                    <strong>
                      <em>{String(index + 1).padStart(2, "0")}</em>
                      {step.phase}
                    </strong>
                    <span>{step.timing}</span>
                  </div>
                  <p>{step.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="source-note">
          8/14 인수·탁송과 8/18 수령은 확정 일정이고, 틴팅과 PPF는 한 패키지로 같이 진행된다.
          첫 주·첫 달 구간의 소요일은 커뮤니티 실측 후기를 참고한 추정이다.
        </p>
      </section>
    </>
  );
}

// ── 할 일 ──────────────────────────────────────────────────────────────
function ChecklistView() {
  return (
    <>
      <section className="section-band">
        <SectionHeader eyebrow="단계 요약" title="인수 전부터 정기 정비까지" />
        <div className="prep-grid">
          {ownerChecklist.map((group) => {
            const Icon = group.icon;
            return (
              <article className="prep-card" key={group.phase}>
                <div className="prep-card-head">
                  <Icon size={20} aria-hidden="true" />
                  <strong>{group.phase}</strong>
                  <span>{group.items.length}개</span>
                </div>
                <p className="prep-card-summary">{group.summary}</p>
              </article>
            );
          })}
        </div>
      </section>

      <ChecklistManager
        groups={ownerChecklist}
        storeKey={OWNER_CHECKLIST_STORE_KEY}
        changeEvent={OWNER_CHECKLIST_EVENT}
      />
    </>
  );
}

// ── 차량 ───────────────────────────────────────────────────────────────
function CarView({ tab, setTab }: { tab: CarTab; setTab: (tab: CarTab) => void }) {
  return (
    <>
      <Segmented
        options={[
          { value: "display", label: "화면 사용법" },
          { value: "data", label: "데이터·프라이버시" },
          { value: "care", label: "정비·비용" }
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "display" ? <DisplayGuide /> : null}
      {tab === "data" ? (
        <section className="section-band">
          <SectionHeader
            eyebrow="데이터·프라이버시"
            title="내 데이터가 어디에 쌓이고, 뭘 끌 수 있는가"
            action={
              <a
                className="ghost-button"
                href="https://www.tesla.com/ko_KR/legal/privacy"
                target="_blank"
                rel="noreferrer"
              >
                Tesla 개인정보 방침
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            }
          />
          <DataPolicyBoard />
        </section>
      ) : null}
      {tab === "care" ? <CareSection /> : null}
    </>
  );
}

function CareSection() {
  return (
    <>
      <section className="section-band">
        <SectionHeader eyebrow="정비 주기" title="테슬라 공식 유지보수 항목" />
        <div className="service-table maintenance-table">
          {maintenanceRows.map((row) => (
            <div className="service-row" key={row.item}>
              <strong>{row.item}</strong>
              <em>{row.cycle}</em>
              <span>{row.note}</span>
            </div>
          ))}
        </div>
        <p className="source-note">
          출처: Tesla Model Y 오너 매뉴얼 &ldquo;유지보수 정비 주기&rdquo;(
          <a
            href="https://www.tesla.com/ownersmanual/modely/ko_kr/GUID-E95DAAD9-646E-4249-9930-B109ED7B1D91.html"
            target="_blank"
            rel="noreferrer"
          >
            공식 문서
          </a>
          ). 테슬라는 내연기관처럼 정해진 정기 점검 주기를 두지 않고 항목별 주기만 제시한다.
        </p>
      </section>

      <section className="section-band">
        <SectionHeader eyebrow="인수 후 지출" title="앞으로 나갈 돈" />
        <div className="budget-grid">
          {ownerCostBuckets.map((bucket) => {
            const Icon = bucket.icon;
            return (
              <article className="budget-card" key={bucket.title}>
                <Icon size={22} aria-hidden="true" />
                <div>
                  <span>{bucket.title}</span>
                  <strong>{bucket.amount}</strong>
                  <p>{bucket.detail}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-band">
        <SectionHeader
          eyebrow="내 차 제원"
          title="Model Y Premium RWD"
          action={
            <a
              className="ghost-button"
              href="https://www.tesla.com/ko_kr/modely"
              target="_blank"
              rel="noreferrer"
            >
              공식 제원
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          }
        />
        <div className="spec-grid" aria-label="Model Y Premium RWD 핵심 제원">
          {specs.map((spec) => (
            <article className="spec-card" key={spec.label}>
              <span>{spec.label}</span>
              <strong>{spec.value}</strong>
              <small>{spec.note}</small>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

// ── 장비 ───────────────────────────────────────────────────────────────
function GearView({ tab, setTab }: { tab: GearTab; setTab: (tab: GearTab) => void }) {
  return (
    <>
      <Segmented
        options={[
          { value: "items", label: "용품" },
          { value: "apps", label: "앱·프로그램" }
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "items" ? (
        <section className="section-band">
          <SectionHeader
            eyebrow="용품"
            title="용도가 설명 안 되는 물건은 사지 않는다"
            action={
              <a
                className="ghost-button"
                href="https://shop.tesla.com/ko_kr/category/vehicle-accessories"
                target="_blank"
                rel="noreferrer"
              >
                테슬라 공식몰
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            }
          />
          <GearBoard />
        </section>
      ) : null}
      {tab === "apps" ? <AppsBoard /> : null}
    </>
  );
}

// ── 기록 ───────────────────────────────────────────────────────────────
function LogView() {
  return (
    <>
      <section className="section-band">
        <SectionHeader eyebrow="기록 규칙" title="무엇을 어떤 형식으로 적을지" />
        <div className="owner-log-grid">
          {logGuides.map((item) => {
            const Icon = item.icon;
            return (
              <article className="owner-log-card" key={item.title}>
                <Icon size={20} aria-hidden="true" />
                <strong>{item.title}</strong>
                <p>{item.text}</p>
                <code>{item.example}</code>
              </article>
            );
          })}
        </div>
        <p className="source-note">
          서드파티 데이터 로거(TeslaMate·Tessie 등)는 테슬라 계정 연동이 필요해서 쓰지 않기로 했다.
          대신 아래 메모에 위 형식으로 직접 남긴다. 한 달만 모여도 월 충전비와 실효율이 나온다.
        </p>
      </section>

      <PersonalNotes />

      <section className="section-band">
        <div className="mini-heading">
          <p className="eyebrow">공식 바로가기</p>
          <h3>자주 여는 페이지</h3>
        </div>
        <div className="quick-link-chips">
          {quickLinks.map((link) => (
            <a href={link.url} key={link.url} target="_blank" rel="noreferrer">
              {link.label}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
