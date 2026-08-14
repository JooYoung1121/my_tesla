"use client";

// 충전 탭. 순서가 곧 논리다.
//   지도(어디서) → 충전기 종류(뭐가 필요한가) → 결제·등록(어떻게 내나) → 앱 → 습관

import { ExternalLink, ShieldCheck, Users, HelpCircle } from "lucide-react";
import {
  chargingApps,
  chargingHabits,
  connectorGuides,
  paymentRoutes,
  type Source
} from "@/data/charging";
import { ChargingMap } from "./ChargingMap";

export function SourceBadge({ source }: { source: Source }) {
  const config = {
    공식: { icon: ShieldCheck, slug: "official", title: "공식 문서·공식 스토어에서 확인한 사실" },
    커뮤니티: { icon: Users, slug: "community", title: "오너 커뮤니티 기반 판단(= 추정). 개인차가 있다" },
    확인필요: { icon: HelpCircle, slug: "todo", title: "공식 확인이 안 된 항목. 직접 확인이 필요하다" }
  }[source];
  const Icon = config.icon;
  return (
    <span className={`evidence-badge evidence-${config.slug}`} title={config.title}>
      <Icon size={11} aria-hidden="true" />
      {source}
    </span>
  );
}

export function ChargingMapSection() {
  return (
    <section className="section-band">
      <div className="mini-heading">
        <p className="eyebrow">충전소 지도</p>
        <h3>경기 남부 생활권부터. 내 차로 되는 충전기만 걸러서 본다</h3>
      </div>
      <ChargingMap />
    </section>
  );
}

export function ConnectorSection() {
  return (
    <section className="section-band">
      <div className="mini-heading">
        <p className="eyebrow">충전기 종류</p>
        <h3>국내 테슬라는 어댑터가 한 단계 더 붙는다</h3>
      </div>
      <p className="board-intro">
        테슬라는 독자 규격 충전포트를 쓴다. 슈퍼차저는 그냥 꽂히지만, 그 밖의 국내 충전기는 전부 어댑터를 거친다.
        어떤 어댑터가 어떤 충전기를 여는지가 국내 충전의 전부라고 해도 된다.
      </p>
      <div className="connector-grid">
        {connectorGuides.map((guide) => (
          <article className={`connector-card connector-${guide.id}`} key={guide.id}>
            <div className="connector-head">
              <strong>{guide.title}</strong>
              <SourceBadge source={guide.source} />
            </div>
            <p className="connector-need">{guide.need}</p>
            <dl className="connector-meta">
              <div>
                <dt>속도</dt>
                <dd>{guide.speed}</dd>
              </div>
              <div>
                <dt>어디에</dt>
                <dd>{guide.where}</dd>
              </div>
            </dl>
            <p className="connector-note">{guide.note}</p>
            {guide.url ? (
              <a href={guide.url} target="_blank" rel="noreferrer" className="card-link">
                자세히
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export function PaymentSection() {
  return (
    <>
      <section className="section-band">
        <div className="mini-heading">
          <p className="eyebrow">결제·등록</p>
          <h3>충전기 앞에 섰을 때 결제가 되느냐가 전부다</h3>
        </div>
        <div className="payment-grid">
          {paymentRoutes.map((route, index) => (
            <article className="payment-card" key={route.id}>
              <div className="payment-head">
                <em>{String(index + 1).padStart(2, "0")}</em>
                <strong>{route.title}</strong>
                <SourceBadge source={route.source} />
              </div>
              <dl>
                <div>
                  <dt>쓰는 법</dt>
                  <dd>{route.how}</dd>
                </div>
                <div>
                  <dt>사전 등록</dt>
                  <dd>{route.register}</dd>
                </div>
                <div>
                  <dt>비용</dt>
                  <dd>{route.cost}</dd>
                </div>
              </dl>
              <p className="payment-verdict">{route.verdict}</p>
              <a href={route.url} target="_blank" rel="noreferrer" className="card-link">
                바로가기
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band">
        <div className="mini-heading">
          <p className="eyebrow">충전 습관</p>
          <h3>첫 달에 기준선을 만들어 두면 나머지는 비교로 풀린다</h3>
        </div>
        <div className="habit-grid">
          {chargingHabits.map((habit) => (
            <article className="habit-card" key={habit.title}>
              <div className="habit-head">
                <strong>{habit.title}</strong>
                <SourceBadge source={habit.source} />
              </div>
              <p>{habit.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export function ChargingAppsSection() {
  return (
    <section className="section-band">
      <div className="mini-heading">
        <p className="eyebrow">충전 앱</p>
        <h3>슈퍼차저만 쓸 거면 공식 앱 하나로 끝난다</h3>
      </div>
      <div className="app-grid">
        {chargingApps.map((app) => (
          <article className={`app-card weight-${app.weight === "핵심" ? "core" : "sub"}`} key={app.name}>
            <div className="app-card-head">
              <span className={`pill weight-${app.weight === "핵심" ? "core" : "sub"}`}>{app.weight}</span>
              <SourceBadge source={app.source} />
            </div>
            <a className="app-name" href={app.url} target="_blank" rel="noreferrer">
              {app.name}
              <ExternalLink size={13} aria-hidden="true" />
            </a>
            <p className="app-purpose">{app.role}</p>
            <p className="app-when">
              <em>언제</em>
              {app.when}
            </p>
            <p className="app-note">{app.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
