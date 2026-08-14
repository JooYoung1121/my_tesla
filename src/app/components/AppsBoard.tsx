"use client";

// 앱·연동 탭.
//   필수 앱 → 필수 연동 절차 → 서드파티 계정 연동(선택)
//
// 서드파티는 Fleet API 전환 때문에 "예전 블로그대로 하면 안 되는" 영역이라
// 도구 목록보다 현황 경고를 먼저 세운다.

import { AlertTriangle, ExternalLink, ShieldOff } from "lucide-react";
import {
  coreApps,
  fleetApiStatus,
  requiredFlows,
  revokeGuide,
  thirdPartyTools
} from "@/data/apps";
import { SourceBadge } from "./ChargingBoard";

export function CoreAppsSection() {
  return (
    <section className="section-band">
      <div className="mini-heading">
        <p className="eyebrow">필요한 앱</p>
        <h3>위 셋만 있으면 차는 굴러간다. 나머지는 필요해질 때</h3>
      </div>
      <div className="app-grid">
        {coreApps.map((app) => (
          <article className={`app-card weight-${app.weight === "필수" ? "core" : "sub"}`} key={app.name}>
            <div className="app-card-head">
              <span className={`pill weight-${app.weight === "필수" ? "core" : "sub"}`}>{app.weight}</span>
              <SourceBadge source={app.evidence} />
            </div>
            <a className="app-name" href={app.url} target="_blank" rel="noreferrer">
              {app.name}
              <ExternalLink size={13} aria-hidden="true" />
            </a>
            <div className="app-meta">
              <span>{app.platform}</span>
              <span>{app.cost}</span>
            </div>
            <p className="app-purpose">{app.purpose}</p>
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

export function RequiredFlowSection() {
  return (
    <section className="section-band">
      <div className="mini-heading">
        <p className="eyebrow">필수 연동</p>
        <h3>안 하면 기능이 아예 안 켜지는 것들</h3>
      </div>
      <div className="flow-list">
        {requiredFlows.map((flow, index) => (
          <article className="flow-card" key={flow.id}>
            <div className="flow-head">
              <span className="flow-index">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{flow.title}</strong>
                <p>{flow.target}</p>
              </div>
              <SourceBadge source={flow.evidence} />
            </div>
            <p className="flow-blocker">
              <AlertTriangle size={13} aria-hidden="true" />
              {flow.blocker}
            </p>
            <ol className="flow-steps">
              {flow.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="flow-gotcha">{flow.gotcha}</p>
            {flow.url ? (
              <a href={flow.url} target="_blank" rel="noreferrer" className="card-link">
                공식 문서
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export function ThirdPartySection() {
  return (
    <>
      <section className="section-band">
        <div className="mini-heading">
          <p className="eyebrow">계정 연동 전에</p>
          <h3>{fleetApiStatus.headline}</h3>
        </div>
        <div className="fleet-warning">
          <AlertTriangle size={20} aria-hidden="true" />
          <ul>
            {fleetApiStatus.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <p className="source-note">
          출처:{" "}
          <a href={fleetApiStatus.url} target="_blank" rel="noreferrer">
            TeslaMate 공식 문서 &ldquo;Using the Tesla Fleet API&rdquo;
          </a>
          , Tessie 상태 공지(Owner API deprecated). Tesla의 전환은 점진적이라 계정마다 시점이 다르다 — 지금 되는 방법이
          몇 달 뒤에도 된다는 보장은 없다.
        </p>
      </section>

      <section className="section-band">
        <div className="mini-heading">
          <p className="eyebrow">연동 가능한 도구</p>
          <h3>얻는 것과 치르는 것을 같이 본다</h3>
        </div>
        <div className="tool-grid">
          {thirdPartyTools.map((tool) => (
            <article className="tool-card" key={tool.id}>
              <div className="tool-head">
                <div>
                  <strong>{tool.name}</strong>
                  <span className={`pill kind-${tool.kind === "셀프호스팅" ? "self" : "hosted"}`}>{tool.kind}</span>
                </div>
                <SourceBadge source={tool.evidence} />
              </div>
              <p className="tool-cost">{tool.cost}</p>

              <div className="tool-tradeoff">
                <div>
                  <span>얻는 것</span>
                  <p>{tool.gives}</p>
                </div>
                <div>
                  <span>치르는 것</span>
                  <p>{tool.costs}</p>
                </div>
              </div>

              <details className="tool-steps">
                <summary>연동 절차 {tool.setup.length}단계</summary>
                <ol>
                  {tool.setup.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </details>

              <p className="tool-verdict">{tool.verdict}</p>
              <a href={tool.url} target="_blank" rel="noreferrer" className="card-link">
                공식 사이트
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band">
        <div className="mini-heading">
          <p className="eyebrow">해제</p>
          <h3>{revokeGuide.title}</h3>
        </div>
        <div className="revoke-box">
          <ShieldOff size={18} aria-hidden="true" />
          <ol>
            {revokeGuide.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <p className="source-note">
          붙이는 법만 알고 끊는 법을 모르면 반쪽이다. 특히 관리형 서비스는 권한 회수만으로는 이미 쌓인 주행·위치
          데이터가 남는다.{" "}
          <a href={revokeGuide.url} target="_blank" rel="noreferrer">
            Tesla 공식 안내
          </a>
        </p>
      </section>
    </>
  );
}
