"use client";

// 커뮤니티 탭.
//   위: 실시간 뉴스 피드(Google 뉴스 RSS · /api/feed)
//   아래: 자동 수집이 불가능한 카페·포럼 링크
//
// 왜 나눴는지는 화면에도 적어둔다. "왜 TKC 글이 여기 안 뜨지?"를 매번 다시
// 알아보지 않으려면 이유가 화면에 있어야 한다.

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowUpRight, ExternalLink, Loader2, RefreshCw, Rss } from "lucide-react";
import { communityLinks, feedTopics, quickLinks } from "@/data/community";

type FeedItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string | null;
};

function relativeTime(iso: string | null) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.round((Date.now() - then) / 60_000);
  if (minutes < 60) return `${Math.max(minutes, 1)}분 전`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}시간 전`;
  const days = Math.floor(minutes / (60 * 24));
  if (days < 30) return `${days}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
}

// 구글 뉴스 제목은 "제목 - 매체명" 꼴이라 매체명이 중복 노출된다.
function stripSource(title: string, source: string) {
  if (source && title.endsWith(` - ${source}`)) return title.slice(0, -(source.length + 3));
  return title;
}

export function FeedBoard() {
  const [topic, setTopic] = useState(feedTopics[0]);
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (topicId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/feed?topic=${encodeURIComponent(topicId)}`);
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message ?? "피드를 불러오지 못했다.");
        setItems(null);
      } else {
        setItems(payload.items as FeedItem[]);
      }
    } catch (cause) {
      setError(String(cause));
      setItems(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(topic.id);
  }, [load, topic]);

  return (
    <>
      <section className="section-band">
        <div className="section-heading">
          <div>
            <p className="eyebrow">최신 피드</p>
            <h2>{topic.hint}</h2>
          </div>
          <button className="tiny-button" type="button" onClick={() => void load(topic.id)} title="새로고침">
            <RefreshCw size={14} aria-hidden="true" />
          </button>
        </div>

        <div className="feed-topics" role="tablist" aria-label="피드 주제">
          {feedTopics.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              role="tab"
              aria-selected={candidate.id === topic.id}
              className={candidate.id === topic.id ? "is-active" : ""}
              onClick={() => setTopic(candidate)}
            >
              {candidate.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="charge-alert" role="alert">
            <AlertTriangle size={18} aria-hidden="true" />
            <div>
              <strong>피드를 불러오지 못했다</strong>
              <p>{error}</p>
            </div>
          </div>
        ) : null}

        {loading ? (
          <p className="empty-note">
            <Loader2 size={14} className="spin" aria-hidden="true" /> 불러오는 중…
          </p>
        ) : null}

        <div className="feed-list" aria-live="polite">
          {(items ?? []).map((item) => (
            <a className="feed-row" href={item.link} key={item.link} target="_blank" rel="noreferrer">
              <span className="feed-body">
                <strong>{stripSource(item.title, item.source)}</strong>
                <span className="feed-meta">
                  <em>{item.source}</em>
                  <time>{relativeTime(item.publishedAt)}</time>
                </span>
              </span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ))}
        </div>

        {!loading && items && items.length === 0 ? <p className="empty-note">이 주제의 최근 글이 없다.</p> : null}

        <p className="source-note">
          <Rss size={12} aria-hidden="true" /> Google 뉴스 RSS를 서버에서 15분 캐시로 읽는다. 네이버 카페(TKC)는 RSS가
          없고 로그인이 필요해, Reddit RSS는 서버 IP에서 자주 차단돼(2026-08-14 직접 확인) 자동 수집 대상에서 뺐다.
          그 둘은 아래 링크로 직접 연다.
        </p>
      </section>

      <section className="section-band">
        <div className="mini-heading">
          <p className="eyebrow">커뮤니티</p>
          <h3>문제가 생겼을 때 검색할 곳</h3>
        </div>
        <div className="community-grid">
          {communityLinks.map((link) => (
            <article className="community-card" key={link.url}>
              <div className="community-head">
                <a href={link.url} target="_blank" rel="noreferrer">
                  {link.name}
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
                <span className="pill">{link.kind}</span>
              </div>
              <p className="community-why">{link.why}</p>
              <p className="community-note">{link.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band">
        <div className="mini-heading">
          <p className="eyebrow">공식 바로가기</p>
          <h3>자주 여는 페이지</h3>
        </div>
        <div className="quick-link-chips">
          {quickLinks.map((link) => (
            <a href={link.url} key={link.url} target="_blank" rel="noreferrer">
              {link.label}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
