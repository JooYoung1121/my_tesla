"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  Database,
  ExternalLink,
  Filter,
  LockKeyhole,
  Plus,
  Search,
  Server,
  Star,
  TimerReset,
  type LucideIcon
} from "lucide-react";
import {
  decisionItems,
  aliShoppingList,
  budgetBuckets,
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
  watchedCafes
} from "@/data/home";
import { CafeSearchPanel } from "./CafeSearchPanel";
import { ChecklistManager } from "./ChecklistManager";
import { PersonalNotes } from "./PersonalNotes";

type ViewId = "overview" | "intel" | "buying" | "delivery" | "notes" | "owner";
type TopbarAction = {
  label: string;
  icon: LucideIcon;
  view?: ViewId;
  href?: string;
  external?: boolean;
  primary?: boolean;
};

const views: Array<{
  id: ViewId;
  label: string;
  title: string;
  eyebrow: string;
  description: string;
}> = [
  {
    id: "overview",
    label: "개요",
    title: "오늘 확인할 테슬라 정보",
    eyebrow: "2026년 8월 인수 준비",
    description: "인수 전에는 결정할 것만 남기고, 차량 데이터는 인수 후 연결한다."
  },
  {
    id: "intel",
    label: "정보 검색",
    title: "카페 글과 참고 정보를 주제별로 본다",
    eyebrow: "정보 보드",
    description: "모델 Y 전용 글과 테슬라 공용 글을 함께 보고, 주제가 같은 정보끼리 묶어 확인한다."
  },
  {
    id: "buying",
    label: "구매·시공",
    title: "돈이 들어가는 선택을 한 화면에서 비교한다",
    eyebrow: "구매 계획",
    description: "차량 비용, 필수 준비물, 알리 후보, 시공 업체를 같은 흐름으로 본다."
  },
  {
    id: "delivery",
    label: "인수 준비",
    title: "계약 후부터 첫 달까지 체크한다",
    eyebrow: "체크리스트",
    description: "일정, 결제, 보험, 충전, 시공, 인수 당일 확인을 단계별로 관리한다."
  },
  {
    id: "notes",
    label: "내 기록",
    title: "직접 판단한 내용을 남긴다",
    eyebrow: "개인 메모",
    description: "검색 결과와 별개로 내가 결정한 것, 나중에 볼 링크, 견적 메모를 저장한다."
  },
  {
    id: "owner",
    label: "오너 데이터",
    title: "인수 후 쌓을 기록을 미리 정한다",
    eyebrow: "TeslaMate 이후",
    description: "충전, 효율, 정비 기록은 인수 후 실제 차량 데이터가 생기면 붙인다."
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

const topbarActionsByView: Record<ViewId, TopbarAction[]> = {
  overview: [
    { label: "정보 검색", icon: Search, view: "intel" },
    { label: "구매·시공", icon: Filter, view: "buying" },
    { label: "정보 추가", icon: Plus, view: "notes", primary: true }
  ],
  intel: [
    { label: "구매·시공", icon: Filter, view: "buying" },
    { label: "메모 추가", icon: Plus, view: "notes", primary: true }
  ],
  buying: [
    { label: "공식 제원", icon: ExternalLink, href: "https://www.tesla.com/ko_kr/modely", external: true },
    { label: "인수 준비", icon: Check, view: "delivery" },
    { label: "메모 추가", icon: Plus, view: "notes", primary: true }
  ],
  delivery: [
    { label: "구매·시공", icon: Filter, view: "buying" },
    { label: "메모 추가", icon: Plus, view: "notes", primary: true }
  ],
  notes: [
    { label: "정보 검색", icon: Search, view: "intel" },
    { label: "구매·시공", icon: Filter, view: "buying" }
  ],
  owner: [
    { label: "TeslaMate", icon: Server, href: "/teslamate" },
    { label: "메모 추가", icon: Plus, view: "notes", primary: true }
  ]
};

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

export function TeslaCommandCenter() {
  const [activeView, setActiveView] = useState<ViewId>("overview");
  const currentView = views.find((view) => view.id === activeView) ?? views[0];
  const topbarActions = topbarActionsByView[activeView];

  return (
    <main className="app-shell">
      <aside className="side-rail" aria-label="주요 메뉴">
        <button
          className="brand"
          onClick={() => setActiveView("overview")}
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
          <Database size={18} aria-hidden="true" />
          <span>탭 전환형 개인 허브</span>
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
            {topbarActions.map((action) => {
              const Icon = action.icon;
              const className = action.primary ? "primary-button" : "ghost-button";

              return action.href ? (
                <a
                  className={className}
                  href={action.href}
                  key={action.label}
                  rel={action.external ? "noreferrer" : undefined}
                  target={action.external ? "_blank" : undefined}
                  title={action.label}
                >
                  <Icon size={18} aria-hidden="true" />
                  {action.label}
                </a>
              ) : (
                <button
                  className={className}
                  key={action.label}
                  onClick={() => action.view && setActiveView(action.view)}
                  title={action.label}
                  type="button"
                >
                  <Icon size={18} aria-hidden="true" />
                  {action.label}
                </button>
              );
            })}
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
          {activeView === "overview" ? <OverviewView setActiveView={setActiveView} /> : null}
          {activeView === "intel" ? <IntelView setActiveView={setActiveView} /> : null}
          {activeView === "buying" ? <BuyingView /> : null}
          {activeView === "delivery" ? <DeliveryView /> : null}
          {activeView === "notes" ? <NotesView /> : null}
          {activeView === "owner" ? <OwnerView /> : null}
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

function OverviewView({ setActiveView }: { setActiveView: (view: ViewId) => void }) {
  return (
    <>
      <section className="hero-grid">
        <article className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">개인 정보 허브</p>
            <h2>흩어진 카페 글과 준비 항목을 결정 가능한 정보로 바꾼다.</h2>
            <p>
              필요한 정보는 검색 탭에서 찾고, 비용 결정은 구매·시공 탭에서 비교하고,
              실행 항목은 인수 준비 탭에서 체크한다.
            </p>
          </div>
          <div className="hero-image-wrap">
            <img
              src="/tesla-charging.jpg"
              alt="충전 중인 테슬라 실내 디스플레이"
              className="hero-image"
            />
          </div>
        </article>

        <div className="metric-grid" aria-label="현재 상태">
          {statusMetrics.map((metric) => (
            <article className={`metric metric-${metric.tone}`} key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="signal-strip" aria-label="오늘의 신호">
        {signalCards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="signal-card" key={card.title}>
              <Icon size={22} aria-hidden="true" />
              <div>
                <span>{card.title}</span>
                <strong>{card.value}</strong>
                <p>{card.detail}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="section-band">
        <SectionHeader eyebrow="빠른 작업" title="오늘은 여기서 시작한다" />
        <div className="quick-focus-grid">
          <button onClick={() => setActiveView("intel")} type="button">
            <Search size={20} aria-hidden="true" />
            <strong>카페 글 찾기</strong>
            <span>썬팅, 보험, 충전카드 같은 검색 주제부터 본다.</span>
          </button>
          <button onClick={() => setActiveView("buying")} type="button">
            <Filter size={20} aria-hidden="true" />
            <strong>비용 비교</strong>
            <span>차량 비용, 알리 후보, 업체 견적을 한 묶음으로 본다.</span>
          </button>
          <button onClick={() => setActiveView("delivery")} type="button">
            <Check size={20} aria-hidden="true" />
            <strong>인수 체크</strong>
            <span>계약 후부터 첫 달까지 실행 항목을 터치로 관리한다.</span>
          </button>
        </div>
      </section>
    </>
  );
}

function IntelView({ setActiveView }: { setActiveView: (view: ViewId) => void }) {
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
            <button className="ghost-button" onClick={() => setActiveView("notes")} type="button">
              메모로 보내기
              <Bookmark size={18} aria-hidden="true" />
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

function BuyingView() {
  return (
    <>
      <section className="section-band">
        <SectionHeader
          eyebrow="차량 기준"
          title="모델 Y 프리미엄 RWD 기준값"
          action={
            <a className="ghost-button" href="https://www.tesla.com/ko_kr/modely" target="_blank" rel="noreferrer">
              공식 제원
              <ExternalLink size={18} aria-hidden="true" />
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

function DeliveryView() {
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
                  <Icon size={22} aria-hidden="true" />
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

function NotesView() {
  return <PersonalNotes />;
}

function OwnerView() {
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
