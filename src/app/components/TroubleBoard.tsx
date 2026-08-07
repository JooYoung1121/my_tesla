"use client";

// 사고·트러블 대응. "미리 준비할 건 액세서리가 아니라 사고 사례를 알아두는 것"이라는
// TKC 4년차 오너의 지적에서 출발했다. 상황 → 그때 할 일 → 지금 준비할 것 순서로 본다.

import { AlertTriangle, ExternalLink, ShieldCheck, Users } from "lucide-react";
import { troubleTopics } from "@/data/ownership";

export function TroubleBoard() {
  return (
    <div className="trouble-board">
      <div className="trouble-intro">
        <AlertTriangle size={20} aria-hidden="true" />
        <div>
          <strong>인수 전에 진짜로 준비할 건 물건이 아니라 이것이다.</strong>
          <p>
            액세서리는 나중에 사도 되지만, 저전압 방전으로 문이 안 열리는 상황은 그때 검색해서는
            늦다. 각 항목의 &ldquo;지금 준비할 것&rdquo;은 대부분 돈이 들지 않고 5분이면 끝난다.
          </p>
        </div>
      </div>

      <div className="trouble-list">
        {troubleTopics.map((topic) => (
          <article className="trouble-card" key={topic.id}>
            <div className="trouble-card-head">
              <strong>{topic.title}</strong>
              <span
                className={`app-evidence evidence-${topic.source === "공식" ? "official" : "community"}`}
                title={
                  topic.source === "공식"
                    ? "테슬라 공식 문서로 확인한 대처법"
                    : "오너 커뮤니티 경험 기반. 상황에 따라 다를 수 있다"
                }
              >
                {topic.source === "공식" ? (
                  <ShieldCheck size={11} aria-hidden="true" />
                ) : (
                  <Users size={11} aria-hidden="true" />
                )}
                {topic.source}
              </span>
              {topic.url ? (
                <a href={topic.url} target="_blank" rel="noreferrer" title="출처 열기">
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              ) : null}
            </div>

            <dl className="trouble-fields">
              <div>
                <dt>상황</dt>
                <dd>{topic.symptom}</dd>
              </div>
              <div>
                <dt>그때</dt>
                <dd>{topic.action}</dd>
              </div>
              <div className="trouble-prepare">
                <dt>지금</dt>
                <dd>{topic.prepare}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <p className="source-note">
        저전압 방전 대처는 Tesla 공식 서비스 문서 기준이고, 나머지는 오너 커뮤니티 경험을 정리한
        것이라 상황에 따라 다를 수 있다. 실제 사고가 나면 보험사와 서비스센터 안내를 우선한다.
      </p>
    </div>
  );
}
