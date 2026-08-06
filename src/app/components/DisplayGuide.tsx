"use client";

// 화면(디스플레이) 사용법. 테슬라는 물리 버튼이 거의 없어서
// "이 기능이 화면 어디에 있는가"를 모르면 조작 자체가 막힌다.
// ★로 시작하는 note는 모르면 실제로 곤란해지는 항목이라 눈에 띄게 표시한다.

import { AlertTriangle, ExternalLink, MonitorSmartphone, ShieldCheck, Users } from "lucide-react";
import { displayGroups } from "@/data/ownership";

export function DisplayGuide() {
  return (
    <div className="display-guide">
      <div className="display-intro">
        <MonitorSmartphone size={20} aria-hidden="true" />
        <div>
          <strong>남아 있는 물리 조작은 다섯 개뿐이다.</strong>
          <p>
            방향지시등 스토크, 스티어링 휠 버튼·스크롤휠, 도어 열림 버튼, 천장 비상등, 그리고 전동
            트렁크 버튼. 나머지는 전부 15.4인치 화면 안에 있다. 주니퍼는 모델3 하이랜드와 달리
            좌측 방향지시등 스토크가 유지됐다.
          </p>
        </div>
      </div>

      {displayGroups.map((group) => (
        <section className="section-band" key={group.id}>
          <div className="mini-heading">
            <p className="eyebrow">{group.title}</p>
            <h3>{group.intro}</h3>
          </div>

          <div className="display-list">
            {group.items.map((item) => {
              const critical = item.note.startsWith("★");
              return (
                <article className={`display-row${critical ? " is-critical" : ""}`} key={item.id}>
                  <div className="display-row-head">
                    <strong>{item.title}</strong>
                    <span
                      className={`app-evidence evidence-${item.source === "공식" ? "official" : "community"}`}
                      title={
                        item.source === "공식"
                          ? "테슬라 공식 매뉴얼·지원 문서로 확인한 항목"
                          : "오너 커뮤니티 후기 기반. 세대·연식에 따라 다를 수 있다"
                      }
                    >
                      {item.source === "공식" ? (
                        <ShieldCheck size={11} aria-hidden="true" />
                      ) : (
                        <Users size={11} aria-hidden="true" />
                      )}
                      {item.source}
                    </span>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noreferrer" title="출처 열기">
                        <ExternalLink size={13} aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>

                  <p className="display-how">
                    <em>위치</em>
                    {item.how}
                  </p>
                  <p className={`display-note${critical ? " is-critical" : ""}`}>
                    {critical ? <AlertTriangle size={12} aria-hidden="true" /> : null}
                    {critical ? item.note.slice(1).trim() : item.note}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <p className="source-note">
        조작 위치는 Tesla Model Y 오너 매뉴얼과 지원 문서를 기준으로 정리했고, 세대별 차이가 있는
        항목(방향지시등·와이퍼)은 국내 오너 후기로 교차 확인해 &ldquo;커뮤니티&rdquo; 배지를 달았다.
        소프트웨어 업데이트로 메뉴 위치가 바뀔 수 있으니 실제 화면과 다르면 차량 화면 기준을 따른다.
      </p>
    </div>
  );
}
