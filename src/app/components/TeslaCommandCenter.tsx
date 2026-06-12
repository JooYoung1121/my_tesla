"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  BrainCircuit,
  Check,
  Database,
  ExternalLink,
  Filter,
  LockKeyhole,
  Search,
  Server,
  Star,
  TimerReset,
  Zap
} from "lucide-react";
import {
  autopilotLevels,
  decisionItems,
  aliShoppingList,
  budgetBuckets,
  deliveryChecklist,
  deliveryTarget,
  essentialSupplies,
  intelItems,
  modelYPremiumRwdSpecs,
  ownerLogItems,
  prepGroups,
  searchGroups,
  serviceCostRows,
  shopCandidates,
  signalCards,
  statusMetrics,
  teslaBasics,
  teslaBasicsChecklist,
  teslaBasicsSources,
  watchedCafes
} from "@/data/home";
import { CafeSearchPanel } from "./CafeSearchPanel";
import { ChecklistManager } from "./ChecklistManager";
import { PersonalNotes } from "./PersonalNotes";

type ViewId = "today" | "intel" | "prep" | "owner";
type IntelTab = "search" | "basics";
type PrepTab = "buying" | "checklist";
type OwnerTab = "notes" | "plan";

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
    title: "오늘 확인할 테슬라 정보",
    eyebrow: "Model Y Cockpit",
    description: "인수까지 남은 시간과 준비 상태를 한 화면에서 본다."
  },
  {
    id: "intel",
    label: "정보",
    title: "카페 글과 기본기를 한 곳에서 본다",
    eyebrow: "Intel",
    description: "주제별 카페 글 검색과 FSD·생산지 같은 헷갈리는 기본기를 같이 정리한다."
  },
  {
    id: "prep",
    label: "준비",
    title: "돈 쓰는 결정과 실행 체크를 관리한다",
    eyebrow: "Preparation",
    description: "차량 비용, 시공 견적, 알리 후보를 비교하고 인수 체크리스트로 실행한다."
  },
  {
    id: "owner",
    label: "오너",
    title: "내 판단과 인수 후 데이터 계획",
    eyebrow: "Owner",
    description: "직접 결정한 메모를 남기고, 인수 후 쌓을 차량 데이터를 미리 설계한다."
  }
];

const infoTopicGroups = [
  {
    title: "인수 직후 시공",
    tags: ["썬팅", "PPF", "블랙박스"],
    text: "시공 예약과 예산에 바로 연결되는 글을 먼저 확인한다."
  },
  {
    title: "돈이 움직이는 항목",
    tags: ["보험", "보조금", "등록비"],
    text: "계약 후 실제 지출이 생기는 순서대로 비교한다."
  },
  {
    title: "생활 루틴",
    tags: ["충전", "하이패스", "앱 설정"],
    text: "인수 후 첫 달에 반복해서 쓰는 습관을 따로 모은다."
  },
  {
    title: "나중에 살 것",
    tags: ["액세서리", "알리", "공용 테슬라"],
    text: "모델 Y 전용 부품과 전 차종 공용 액세서리를 나눠서 본다."
  }
];

const CHECKLIST_STORE_KEY = "my-tesla-checklist-v1";

function useChecklistReadiness() {
  const [readiness, setReadiness] = useState<{ done: number; total: number; percent: number } | null>(
    null
  );

  useEffect(() => {
    let states: Record<string, { done: boolean }> = {};
    let customItems: Array<{ done: boolean }> = [];
    try {
      const parsed = JSON.parse(window.localStorage.getItem(CHECKLIST_STORE_KEY) ?? "{}");
      states = parsed.states ?? {};
      customItems = Array.isArray(parsed.customItems) ? parsed.customItems : [];
    } catch {
      // 저장된 상태가 없으면 기본 상태로 계산한다.
    }

    const defaults = deliveryChecklist.flatMap((group) =>
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
  }, []);

  return readiness;
}

function useDday(targetDate: string) {
  const [dday, setDday] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(`${targetDate}T00:00:00+09:00`).getTime();
    const now = Date.now();
    setDday(Math.max(0, Math.ceil((target - now) / 86_400_000)));
  }, [targetDate]);

  return dday;
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
  const [intelTab, setIntelTab] = useState<IntelTab>("search");
  const [prepTab, setPrepTab] = useState<PrepTab>("buying");
  const [ownerTab, setOwnerTab] = useState<OwnerTab>("notes");
  const currentView = views.find((view) => view.id === activeView) ?? views[0];

  function goTo(view: ViewId, segment?: IntelTab | PrepTab | OwnerTab) {
    if (view === "intel" && segment) setIntelTab(segment as IntelTab);
    if (view === "prep" && segment) setPrepTab(segment as PrepTab);
    if (view === "owner" && segment) setOwnerTab(segment as OwnerTab);
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
            <small>모델 Y 준비실</small>
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
          <span>개인용 정보 허브</span>
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
              href="https://www.tesla.com/ko_kr/modely"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={16} aria-hidden="true" />
              공식 제원
            </a>
            <button
              className="primary-button"
              onClick={() => goTo("owner", "notes")}
              type="button"
            >
              <Bookmark size={16} aria-hidden="true" />
              메모
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
          {activeView === "intel" ? (
            <IntelView tab={intelTab} setTab={setIntelTab} goTo={goTo} />
          ) : null}
          {activeView === "prep" ? <PrepView tab={prepTab} setTab={setPrepTab} /> : null}
          {activeView === "owner" ? <OwnerView tab={ownerTab} setTab={setOwnerTab} /> : null}
        </section>

        <footer className="footer">
          <span>마이 테슬라</span>
          <a href="https://tkc.kr/" target="_blank" rel="noreferrer">
            TKC 참고
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <a href="https://docs.teslamate.org/docs/installation/docker/" target="_blank" rel="noreferrer">
            TeslaMate
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <a href="https://unsplash.com/photos/3oA3NA8_mbE" target="_blank" rel="noreferrer">
            사진 출처
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <span className="footer-star">
            <Star size={14} aria-hidden="true" />
            한글 UI 기준
          </span>
        </footer>
      </section>
    </main>
  );
}

function TodayView({ goTo }: { goTo: (view: ViewId, segment?: IntelTab | PrepTab | OwnerTab) => void }) {
  const dday = useDday(deliveryTarget.date);
  const readiness = useChecklistReadiness();
  const intelMetric = statusMetrics[1];
  const candidateMetric = statusMetrics[2];

  return (
    <section className="bento-grid" aria-label="오늘의 콕핏">
      <article className="bento-hero">
        <img src="/tesla-charging.jpg" alt="충전 중인 테슬라 실내 디스플레이" />
        <div className="bento-hero-overlay" aria-hidden="true" />
        <div className="bento-hero-content">
          <p className="hero-kicker">Model Y · Premium RWD</p>
          <h2>
            인수까지 <span className="dday">{dday === null ? "D-?" : `D-${dday}`}</span>
          </h2>
          <p>{deliveryTarget.note}</p>
          <div className="hero-chips">
            <span>
              <Zap size={13} aria-hidden="true" />
              {deliveryTarget.label}
            </span>
            <span>기가 상하이 생산분</span>
            <span>4,999만 원</span>
          </div>
        </div>
      </article>

      <div className="bento-side">
        <article className="bento-tile bento-ready">
          <span>인수 준비율</span>
          <strong>
            {readiness ? readiness.percent : 0}
            <em>%</em>
          </strong>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${readiness?.percent ?? 0}%` }} />
          </div>
          <small>
            {readiness
              ? `체크리스트 ${readiness.total}개 중 ${readiness.done}개 완료. 준비 탭에서 갱신된다.`
              : "체크리스트 기준으로 계산한다."}
          </small>
        </article>

        <div className="bento-mini-grid">
          <article className="bento-tile bento-mini">
            <span>{intelMetric.label}</span>
            <strong>{intelMetric.value}</strong>
            <small>{intelMetric.detail}</small>
          </article>
          <article className="bento-tile bento-mini">
            <span>{candidateMetric.label}</span>
            <strong>{candidateMetric.value}</strong>
            <small>{candidateMetric.detail}</small>
          </article>
        </div>
      </div>

      {signalCards.map((card) => {
        const Icon = card.icon;
        return (
          <article className="bento-tile bento-signal" key={card.title}>
            <Icon size={20} aria-hidden="true" />
            <div>
              <span>{card.title}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </div>
          </article>
        );
      })}

      <div className="bento-tile bento-actions" aria-label="빠른 작업">
        <button onClick={() => goTo("intel", "search")} type="button">
          <Search size={19} aria-hidden="true" />
          <strong>카페 글 찾기</strong>
          <span>썬팅, 보험, 충전카드 같은 검색 주제부터 본다.</span>
        </button>
        <button onClick={() => goTo("intel", "basics")} type="button">
          <BrainCircuit size={19} aria-hidden="true" />
          <strong>테슬라 기초</strong>
          <span>FSD, 오토파일럿, 생산지, OTA처럼 헷갈리는 말을 정리한다.</span>
        </button>
        <button onClick={() => goTo("prep", "buying")} type="button">
          <Filter size={19} aria-hidden="true" />
          <strong>비용 비교</strong>
          <span>차량 비용, 알리 후보, 업체 견적을 한 묶음으로 본다.</span>
        </button>
        <button onClick={() => goTo("prep", "checklist")} type="button">
          <Check size={19} aria-hidden="true" />
          <strong>인수 체크</strong>
          <span>계약 후부터 첫 달까지 실행 항목을 터치로 관리한다.</span>
        </button>
      </div>
    </section>
  );
}

function IntelView({
  tab,
  setTab,
  goTo
}: {
  tab: IntelTab;
  setTab: (tab: IntelTab) => void;
  goTo: (view: ViewId, segment?: IntelTab | PrepTab | OwnerTab) => void;
}) {
  return (
    <>
      <Segmented
        options={[
          { value: "search", label: "카페·정보" },
          { value: "basics", label: "테슬라 기초" }
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "search" ? <IntelSearchSection goTo={goTo} /> : <BasicsSection />}
    </>
  );
}

function IntelSearchSection({
  goTo
}: {
  goTo: (view: ViewId, segment?: IntelTab | PrepTab | OwnerTab) => void;
}) {
  return (
    <>
      <section className="section-band">
        <SectionHeader eyebrow="정보 묶음" title="비슷한 내용끼리 먼저 묶어 본다" />
        <div className="topic-grid">
          {infoTopicGroups.map((group) => (
            <article className="topic-card" key={group.title}>
              <strong>{group.title}</strong>
              <p>{group.text}</p>
              <div>
                {group.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band">
        <SectionHeader eyebrow="검색 주제" title="찾아볼 키워드와 현재 판단" />
        <div className="search-groups">
          {searchGroups.map((group) => {
            const Icon = group.icon;
            return (
              <button className="search-chip" key={group.label} type="button">
                <Icon size={16} aria-hidden="true" />
                <span>{group.label}</span>
                <strong>{group.count}</strong>
              </button>
            );
          })}
        </div>

        <div className="intel-table" role="table" aria-label="저장 예정 정보">
          <div className="intel-row intel-head" role="row">
            <span>분류</span>
            <span>제목</span>
            <span>출처</span>
            <span>상태</span>
            <span>요약</span>
          </div>
          {intelItems.map((item) => (
            <article className="intel-row" role="row" key={item.title}>
              <span className="pill">{item.category}</span>
              <strong>{item.title}</strong>
              <span>{item.source}</span>
              <span className={`priority priority-${item.priority}`}>{item.priority}</span>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <CafeSearchPanel />

      <section className="section-band">
        <SectionHeader
          eyebrow="카페 후보"
          title="공개글 검색으로 감시할 카페"
          action={
            <button className="ghost-button" onClick={() => goTo("owner", "notes")} type="button">
              메모로 보내기
              <Bookmark size={16} aria-hidden="true" />
            </button>
          }
        />
        <div className="cafe-grid">
          {watchedCafes.map((cafe) => (
            <article className="cafe-card" key={cafe.slug}>
              <span>{cafe.slug}</span>
              <strong>{cafe.name}</strong>
              <p>{cafe.note}</p>
              <div>
                <small>clubId {cafe.clubId}</small>
                <a href={cafe.url} target="_blank" rel="noreferrer">
                  열기
                  <ExternalLink size={15} aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function BasicsSection() {
  return (
    <>
      <section className="section-band">
        <SectionHeader eyebrow="핵심 정리" title="공장보다 중요한 것은 지역, 옵션, 하드웨어다" />
        <div className="basic-card-grid">
          {teslaBasics.map((item) => {
            const Icon = item.icon;
            return (
              <article className="basic-card" key={item.title}>
                <div className="basic-card-head">
                  <Icon size={22} aria-hidden="true" />
                  <span>{item.verdict}</span>
                </div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
                <div>
                  {item.tags.map((tag) => (
                    <em key={tag}>{tag}</em>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-band">
        <SectionHeader eyebrow="용어 구분" title="오토파일럿과 FSD를 같은 말로 보지 않는다" />
        <div className="autopilot-list">
          {autopilotLevels.map((item) => (
            <article className="autopilot-row" key={item.label}>
              <strong>{item.label}</strong>
              <p>{item.summary}</p>
              <span>{item.check}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="basics-columns">
        <article className="basics-panel">
          <div className="mini-heading">
            <p className="eyebrow">인수 후 확인</p>
            <h3>내 차 기준으로 판정할 것</h3>
          </div>
          <ul className="basics-checklist">
            {teslaBasicsChecklist.map((item) => (
              <li key={item}>
                <Check size={16} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="basics-panel">
          <div className="mini-heading">
            <p className="eyebrow">공식·참고 링크</p>
            <h3>나중에 다시 확인할 출처</h3>
          </div>
          <div className="basic-source-list">
            {teslaBasicsSources.map((source) => (
              <a href={source.url} key={source.url} target="_blank" rel="noreferrer">
                <span>{source.label}</span>
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function PrepView({ tab, setTab }: { tab: PrepTab; setTab: (tab: PrepTab) => void }) {
  return (
    <>
      <Segmented
        options={[
          { value: "buying", label: "구매·시공" },
          { value: "checklist", label: "인수 체크리스트" }
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "buying" ? <BuyingSection /> : <DeliverySection />}
    </>
  );
}

function BuyingSection() {
  return (
    <>
      <section className="section-band">
        <SectionHeader
          eyebrow="차량 기준"
          title="모델 Y 프리미엄 RWD 기준값"
          action={
            <a className="ghost-button" href="https://www.tesla.com/ko_kr/modely" target="_blank" rel="noreferrer">
              공식 제원
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          }
        />
        <div className="spec-grid" aria-label="모델 Y 프리미엄 RWD 핵심 제원">
          {modelYPremiumRwdSpecs.map((spec) => (
            <article className="spec-card" key={spec.label}>
              <span>{spec.label}</span>
              <strong>{spec.value}</strong>
              <small>{spec.note}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band">
        <SectionHeader eyebrow="예산 흐름" title="차량 비용에서 시공비까지" />
        <div className="budget-grid">
          {budgetBuckets.map((bucket) => {
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

      <section className="buying-columns">
        <article className="buying-panel scroll-panel">
          <div className="mini-heading">
            <p className="eyebrow">필수 준비물</p>
            <h3>인수 전에 결정할 것</h3>
          </div>
          <div className="supply-list">
            {essentialSupplies.map((supply) => (
              <div className="supply-item" key={supply.item}>
                <div>
                  <strong>{supply.item}</strong>
                  <span>{supply.memo}</span>
                </div>
                <div>
                  <em>{supply.priority}</em>
                  <small>{supply.timing}</small>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="buying-panel scroll-panel">
          <div className="mini-heading">
            <p className="eyebrow">알리 구매 후보</p>
            <h3>싸게 사도 괜찮은 것부터</h3>
          </div>
          <div className="ali-list">
            {aliShoppingList.map((item) => (
              <div className="ali-item" key={item.item}>
                <div>
                  <strong>{item.item}</strong>
                  <span>{item.memo}</span>
                </div>
                <div>
                  <em>{item.range}</em>
                  <small>{item.timing}</small>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    상품 찾기
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="service-board">
        <article className="service-panel scroll-panel">
          <div className="mini-heading">
            <p className="eyebrow">시공 비용</p>
            <h3>견적 받을 때의 기준선</h3>
          </div>
          <div className="service-table">
            {serviceCostRows.map((row) => (
              <div className="service-row" key={row.work}>
                <strong>{row.work}</strong>
                <em>{row.range}</em>
                <span>{row.memo}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="service-panel scroll-panel">
          <div className="mini-heading">
            <p className="eyebrow">업체 후보</p>
            <h3>추천이 아니라 견적 비교 목록</h3>
          </div>
          <div className="shop-grid">
            {shopCandidates.map((shop) => (
              <a className="shop-chip" href={shop.url} key={shop.name} target="_blank" rel="noreferrer">
                <strong>{shop.name}</strong>
                <span>{shop.area}</span>
                <small>{shop.note}</small>
                <em>
                  열기
                  <ExternalLink size={13} aria-hidden="true" />
                </em>
              </a>
            ))}
          </div>
        </article>
      </section>

      <section className="section-band">
        <SectionHeader eyebrow="결정 노트" title="살 것과 보류할 것" />
        <div className="decision-list compact-list">
          {decisionItems.map((item) => (
            <article className="decision-item" key={item.label}>
              <div>
                <strong>{item.label}</strong>
                <span>{item.reason}</span>
              </div>
              <div>
                <em>{item.amount}</em>
                <small>{item.state}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function DeliverySection() {
  return (
    <>
      <section className="section-band">
        <SectionHeader eyebrow="단계 요약" title="계약 후부터 첫 달까지" />
        <div className="prep-grid">
          {prepGroups.map((group) => {
            const Icon = group.icon;
            return (
              <article className="prep-card" key={group.phase}>
                <div className="prep-card-head">
                  <Icon size={20} aria-hidden="true" />
                  <strong>{group.phase}</strong>
                  <span>{group.progress}%</span>
                </div>
                <div className="progress-track" aria-hidden="true">
                  <span style={{ width: `${group.progress}%` }} />
                </div>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>
                      <Check size={15} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <ChecklistManager />
    </>
  );
}

function OwnerView({ tab, setTab }: { tab: OwnerTab; setTab: (tab: OwnerTab) => void }) {
  return (
    <>
      <Segmented
        options={[
          { value: "notes", label: "내 기록" },
          { value: "plan", label: "데이터 계획" }
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "notes" ? <PersonalNotes /> : <OwnerPlanSection />}
    </>
  );
}

function OwnerPlanSection() {
  return (
    <>
      <section className="section-band">
        <SectionHeader
          eyebrow="오너 로그"
          title="인수 후 쌓을 데이터"
          action={
            <a className="icon-button" href="/teslamate" title="TeslaMate 문서">
              <Server size={18} aria-hidden="true" />
            </a>
          }
        />
        <div className="owner-log-grid">
          {ownerLogItems.map((item) => {
            const Icon = item.icon;
            return (
              <article className="owner-log-card" key={item.title}>
                <Icon size={20} aria-hidden="true" />
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="system-strip" aria-label="시스템 방향">
        <article>
          <LockKeyhole size={20} aria-hidden="true" />
          <strong>개인용 우선</strong>
          <span>처음엔 단순 비밀번호, 이후 Auth.js 검토</span>
        </article>
        <article>
          <Database size={20} aria-hidden="true" />
          <strong>저장소</strong>
          <span>Supabase 또는 Neon PostgreSQL</span>
        </article>
        <article>
          <TimerReset size={20} aria-hidden="true" />
          <strong>TeslaMate</strong>
          <span>차량 인수 후 별도 서버로 판단</span>
        </article>
        <a href="/teslamate" className="system-link">
          <ExternalLink size={18} aria-hidden="true" />
          문서 보기
        </a>
      </section>
    </>
  );
}
