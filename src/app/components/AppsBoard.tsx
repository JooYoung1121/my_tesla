"use client";

// 앱·프로그램 보드. "설치 목록"이 아니라 "언제 왜 필요한가"를 기준으로 묶는다.
// evidence 배지로 공식 확인 사실과 커뮤니티 추천(= 추정)을 구분해서 표시한다.
// 테슬라 계정 연동이 필요한 서드파티 로거(TeslaMate·Tessie 등)는 쓰지 않기로 해서 빠져 있다.

import { ExternalLink, ShieldCheck, Users } from "lucide-react";
import { appGroups, PRIORITY_SLUG } from "@/data/ownership";

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

      <p className="source-note">
        주행·충전 데이터를 자동으로 기록하는 서드파티 앱(TeslaMate, Tessie 등)은 테슬라 계정 연동과
        접근 토큰 발급이 필요해서 쓰지 않기로 했다. 여기 있는 앱은 전부 계정 연동 없이 쓰거나
        (Tesla 공식 앱처럼) 차량 자체를 쓰기 위해 필요한 것들이다. 기록은 기록 탭에 직접 남긴다.
      </p>
    </div>
  );
}
