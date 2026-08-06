"use client";

// 데이터·프라이버시. 종류별로 "무엇 / 어디에 / 내가 제어할 수 있는 것 / 지금 할 일"
// 네 칸으로 쪼갠다. 막연한 불안 대신 실제로 누를 수 있는 스위치를 보여주는 게 목적이다.

import { ExternalLink, ShieldCheck, Users } from "lucide-react";
import { dataTopics } from "@/data/ownership";

export function DataPolicyBoard() {
  const actionable = dataTopics.filter((topic) => topic.action.startsWith("★"));

  return (
    <div className="data-board">
      {actionable.length > 0 ? (
        <div className="data-priority">
          <strong>인수 첫 주에 반드시 할 것</strong>
          <ul>
            {actionable.map((topic) => (
              <li key={topic.id}>
                <em>{topic.topic}</em>
                {topic.action.slice(1).trim()}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="data-grid">
        {dataTopics.map((topic) => (
          <article className="data-card" key={topic.id}>
            <div className="data-card-head">
              <strong>{topic.topic}</strong>
              <span
                className={`app-evidence evidence-${topic.source === "공식" ? "official" : "community"}`}
                title={
                  topic.source === "공식"
                    ? "테슬라·TeslaMate 공식 문서로 확인한 항목"
                    : "커뮤니티·문서 종합 판단"
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

            <dl className="data-fields">
              <div>
                <dt>무엇</dt>
                <dd>{topic.what}</dd>
              </div>
              <div>
                <dt>어디에</dt>
                <dd>{topic.where}</dd>
              </div>
              <div>
                <dt>내 제어권</dt>
                <dd>{topic.control}</dd>
              </div>
              <div className="data-action">
                <dt>할 일</dt>
                <dd>{topic.action.startsWith("★") ? topic.action.slice(1).trim() : topic.action}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <p className="source-note">
        테슬라 관련 사항은{" "}
        <a href="https://www.tesla.com/ko_KR/legal/privacy" target="_blank" rel="noreferrer">
          Tesla 고객 개인정보 취급방침
        </a>
        과 오너 매뉴얼·지원 문서 기준이다(2026-08-07 확인). 정책은 바뀔 수 있으므로 중요한 판단
        전에는 원문을 다시 볼 것. TeslaMate 항목은 도입했을 때만 해당한다.
      </p>
    </div>
  );
}
