"use client";

// 앱·프로그램 보드. "설치 목록"이 아니라 "언제 왜 필요한가"를 기준으로 묶는다.
// evidence 배지로 공식 확인 사실과 커뮤니티 추천(= 추정)을 구분해서 표시한다.

import { AlertTriangle, ExternalLink, ShieldCheck, Users } from "lucide-react";
import { appGroups, PRIORITY_SLUG, teslamateLinks, teslamateSteps } from "@/data/ownership";

export function AppsBoard() {
  return (
    <div className="apps-board">
      {appGroups.map((group) => (
        <section className="section-band" key={group.id}>
          <div className="mini-heading">
            <p className="eyebrow">{group.title}</p>
            <h3>{group.intro}</h3>
          </div>
          <div className="app-grid">
            {group.items.map((app) => (
              <article className={`app-card priority-${PRIORITY_SLUG[app.priority]}`} key={app.name}>
                <div className="app-card-head">
                  <span className={`pill gear-priority priority-${PRIORITY_SLUG[app.priority]}`}>
                    {app.priority}
                  </span>
                  <span
                    className={`app-evidence evidence-${app.evidence === "공식" ? "official" : "community"}`}
                    title={
                      app.evidence === "공식"
                        ? "공식 스토어·공식 문서로 존재와 용도를 확인한 항목"
                        : "오너 커뮤니티 추천 기반. 존재는 확인했지만 실사용 만족도는 개인차가 있다"
                    }
                  >
                    {app.evidence === "공식" ? (
                      <ShieldCheck size={11} aria-hidden="true" />
                    ) : (
                      <Users size={11} aria-hidden="true" />
                    )}
                    {app.evidence}
                  </span>
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
                  <em>설치 시점</em>
                  {app.when}
                </p>
                <p className="app-note">{app.note}</p>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="section-band teslamate-guide">
        <div className="section-heading">
          <div>
            <p className="eyebrow">셀프호스팅</p>
            <h2>TeslaMate 설치 순서</h2>
          </div>
          <a className="ghost-button" href="/teslamate" title="TeslaMate 개요 문서">
            개요 문서
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>

        <div className="teslamate-notice">
          <AlertTriangle size={16} aria-hidden="true" />
          <div>
            <strong>인수 직후에 하지 않는다.</strong>
            <span>
              한 달쯤 공식 앱만 써보고, 충전비·효율 추세를 자동으로 남길 필요가 실제로 생겼는지
              확인한 뒤에 설치한다. 데이터가 없는 상태에서 서버부터 세우면 운영 부담만 남는다.
            </span>
          </div>
        </div>

        <ol className="teslamate-steps">
          {teslamateSteps.map((step, index) => (
            <li key={step.step}>
              <span className="teslamate-step-no">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{step.step}</strong>
                <p>{step.detail}</p>
                <p className="teslamate-caution">
                  <AlertTriangle size={12} aria-hidden="true" />
                  {step.caution}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="quick-link-chips">
          {teslamateLinks.map((link) => (
            <a href={link.url} key={link.url} target="_blank" rel="noreferrer">
              {link.label}
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          ))}
        </div>

        <p className="source-note">
          2026-08-05 기준 TeslaMate 공식 문서 확인 결과, 개인 사용자는 아직 비공식 Owner API를 쓸
          수 있고 Fleet API 전환은 Owner API가 완전히 닫힐 때까지 강제되지 않는다. 즉 개인이 쓰는 데
          별도 API 과금은 없다. 다만 테슬라 API 정책은 계속 바뀌므로 실제 설치 시점에{" "}
          <a
            href="https://docs.teslamate.org/docs/configuration/api/"
            target="_blank"
            rel="noreferrer"
          >
            공식 API 문서
          </a>
          를 다시 확인해야 한다.
        </p>
      </section>
    </div>
  );
}
