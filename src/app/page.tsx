import {
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  Database,
  ExternalLink,
  Filter,
  LockKeyhole,
  Plus,
  Search,
  Server,
  Star,
  TimerReset
} from "lucide-react";
import {
  decisionItems,
  aliShoppingList,
  budgetBuckets,
  essentialSupplies,
  intelItems,
  modelYPremiumRwdSpecs,
  navItems,
  ownerLogItems,
  prepGroups,
  searchGroups,
  serviceCostRows,
  shopCandidates,
  signalCards,
  statusMetrics,
  watchedCafes
} from "@/data/home";
import { CafeSearchPanel } from "./components/CafeSearchPanel";
import { ChecklistManager } from "./components/ChecklistManager";
import { PersonalNotes } from "./components/PersonalNotes";

export default function Home() {
  return (
    <main className="app-shell">
      <aside className="side-rail" aria-label="주요 메뉴">
        <a className="brand" href="#today" aria-label="마이 테슬라 홈">
          <span className="brand-mark">Y</span>
          <span>
            <strong>마이 테슬라</strong>
            <small>모델 Y 준비실</small>
          </span>
        </a>

        <nav className="nav-list">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="rail-note">
          <Database size={18} aria-hidden="true" />
          <span>Vercel + PostgreSQL 준비</span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">2026년 8월 인수 준비</p>
            <h1>오늘 확인할 테슬라 정보</h1>
          </div>
          <div className="topbar-actions" aria-label="빠른 동작">
            <a className="icon-button" href="#intel-search" title="검색">
              <Search size={18} aria-hidden="true" />
            </a>
            <a className="icon-button" href="#buying" title="구매 계획">
              <Filter size={18} aria-hidden="true" />
            </a>
            <a className="primary-button" href="#my-notes">
              <Plus size={18} aria-hidden="true" />
              정보 추가
            </a>
          </div>
        </header>

        <section className="hero-grid" id="today">
          <article className="hero-panel">
            <div className="hero-copy">
              <p className="eyebrow">개인 정보 허브</p>
              <h2>흩어진 카페 글과 준비 항목을 결정 가능한 정보로 바꾼다.</h2>
              <p>
                지금은 인수 전 정보 정리에 집중하고, 차량 데이터는 인수 후
                TeslaMate를 별도 저장소로 붙인다.
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

        <section className="section-band" id="intel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">정보 보드</p>
              <h2>검색해서 볼 것과 저장해서 볼 것</h2>
            </div>
            <a className="ghost-button" href="#intel-search">
              전체 보기
              <ChevronRight size={18} aria-hidden="true" />
            </a>
          </div>

          <div className="search-groups">
            {searchGroups.map((group) => {
              const Icon = group.icon;
              return (
                <a className="search-chip" href="#intel-search" key={group.label}>
                  <Icon size={16} aria-hidden="true" />
                  <span>{group.label}</span>
                  <strong>{group.count}</strong>
                </a>
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

          <CafeSearchPanel />
        </section>

        <section className="section-band" id="buying">
          <div className="section-heading">
            <div>
              <p className="eyebrow">구매 계획</p>
              <h2>모델 Y 프리미엄 RWD 기준 예산과 준비물</h2>
            </div>
            <a className="ghost-button" href="https://www.tesla.com/ko_kr/modely" target="_blank" rel="noreferrer">
              공식 제원
              <ExternalLink size={18} aria-hidden="true" />
            </a>
          </div>

          <div className="spec-grid" aria-label="모델 Y 프리미엄 RWD 핵심 제원">
            {modelYPremiumRwdSpecs.map((spec) => (
              <article className="spec-card" key={spec.label}>
                <span>{spec.label}</span>
                <strong>{spec.value}</strong>
                <small>{spec.note}</small>
              </article>
            ))}
          </div>

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

          <div className="buying-columns">
            <article className="buying-panel">
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

            <article className="buying-panel">
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
          </div>

          <div className="service-board">
            <article className="service-panel">
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

            <article className="service-panel">
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
          </div>
        </section>

        <section className="section-band" id="delivery">
          <div className="section-heading">
            <div>
              <p className="eyebrow">인수 준비</p>
              <h2>계약 후부터 첫 달까지</h2>
            </div>
          </div>

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

          <ChecklistManager />
        </section>

        <PersonalNotes />

        <section className="section-band" id="cafes">
          <div className="section-heading">
            <div>
              <p className="eyebrow">카페 수집 후보</p>
              <h2>공개글 검색으로 먼저 감시할 카페</h2>
            </div>
            <a className="ghost-button" href="#intel-search">
              검색으로 이동
              <Database size={18} aria-hidden="true" />
            </a>
          </div>

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

        <section className="split-section">
          <div className="section-band compact" id="decisions">
            <div className="section-heading">
              <div>
                <p className="eyebrow">결정 노트</p>
                <h2>살 것, 보류할 것</h2>
              </div>
              <a className="icon-button" href="#my-notes" title="메모로 이동">
                <Bookmark size={18} aria-hidden="true" />
              </a>
            </div>

            <div className="decision-list">
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
          </div>

          <div className="section-band compact" id="owner-log">
            <div className="section-heading">
              <div>
                <p className="eyebrow">오너 로그</p>
                <h2>인수 후 쌓을 데이터</h2>
              </div>
              <a className="icon-button" href="/teslamate" title="TeslaMate 문서">
                <Server size={18} aria-hidden="true" />
              </a>
            </div>

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
