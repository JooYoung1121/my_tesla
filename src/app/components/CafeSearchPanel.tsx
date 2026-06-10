"use client";

import { ExternalLink, Search, Star, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  naverCafeFetchedAt,
  naverCafeKeywords,
  naverCafeResults
} from "@/data/naver-cafe-results";

type CafeResult = {
  keyword?: string;
  category: string;
  title: string;
  link: string;
  description: string;
  cafename: string;
  cafeurl: string;
  targetCafe: null | {
    slug: string;
    name: string;
  };
};

const SAVED_KEY = "my-tesla-saved-cafe-links";
const HIDDEN_KEY = "my-tesla-hidden-cafe-links";

function readStoredSet(key: string) {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
}

function writeStoredSet(key: string, value: Set<string>) {
  window.localStorage.setItem(key, JSON.stringify(Array.from(value)));
}

export function CafeSearchPanel() {
  const [query, setQuery] = useState("모델Y 썬팅");
  const [items, setItems] = useState<CafeResult[]>(naverCafeResults as unknown as CafeResult[]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [savedLinks, setSavedLinks] = useState<Set<string>>(new Set());
  const [hiddenLinks, setHiddenLinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSavedLinks(readStoredSet(SAVED_KEY));
    setHiddenLinks(readStoredSet(HIDDEN_KEY));
  }, []);

  const fetchedLabel = naverCafeFetchedAt
    ? new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Seoul"
      }).format(new Date(naverCafeFetchedAt))
    : "아직 수집 전";

  const visibleItems = items.filter((item) => !hiddenLinks.has(item.link));

  const counts = useMemo(() => {
    return Array.from(
      visibleItems.reduce((map, item) => {
        map.set(item.category, (map.get(item.category) ?? 0) + 1);
        return map;
      }, new Map<string, number>())
    );
  }, [visibleItems]);

  async function runSearch(nextQuery = query) {
    const cleanQuery = nextQuery.trim();
    if (!cleanQuery) return;

    setIsLoading(true);
    setMessage("");
    setQuery(cleanQuery);

    try {
      const response = await fetch(
        `/api/naver/cafe-search?query=${encodeURIComponent(cleanQuery)}&display=30`
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "검색에 실패했습니다.");
      }

      const nextItems = (payload.items ?? []) as CafeResult[];
      setItems(nextItems.map((item) => ({ ...item, keyword: cleanQuery })));
      setMessage(`${cleanQuery} 검색 결과 ${nextItems.length}건`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "검색에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch();
  }

  function toggleSaved(link: string) {
    const next = new Set(savedLinks);
    if (next.has(link)) {
      next.delete(link);
    } else {
      next.add(link);
    }
    setSavedLinks(next);
    writeStoredSet(SAVED_KEY, next);
  }

  function hideResult(link: string) {
    const next = new Set(hiddenLinks);
    next.add(link);
    setHiddenLinks(next);
    writeStoredSet(HIDDEN_KEY, next);
  }

  function resetHidden() {
    const next = new Set<string>();
    setHiddenLinks(next);
    writeStoredSet(HIDDEN_KEY, next);
  }

  return (
    <div className="live-cafe-board" id="intel-search">
      <div className="live-cafe-head">
        <div>
          <p className="eyebrow">실제 공개글 검색</p>
          <h3>대상 카페 2곳에서 바로 검색한다</h3>
          <p>
            최초 수집 기준 {fetchedLabel}. 검색 버튼을 누르면 Vercel API가
            네이버 카페글 검색을 실행하고, 대상 카페 결과만 보여준다.
          </p>
        </div>
        <div className="live-cafe-counts" aria-label="카테고리별 수집 건수">
          {counts.map(([category, count]) => (
            <span key={category}>
              {category}
              <strong>{count}</strong>
            </span>
          ))}
        </div>
      </div>

      <form className="cafe-search-form" onSubmit={handleSubmit}>
        <label>
          <span>검색어</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="모델Y 썬팅"
          />
        </label>
        <button className="primary-button" disabled={isLoading}>
          <Search size={18} aria-hidden="true" />
          {isLoading ? "검색 중" : "검색"}
        </button>
      </form>

      <div className="keyword-strip" aria-label="검색 키워드">
        {naverCafeKeywords.map((keyword) => (
          <button
            className="keyword-button"
            key={keyword}
            onClick={() => void runSearch(keyword)}
            type="button"
          >
            {keyword}
          </button>
        ))}
      </div>

      <div className="result-toolbar">
        <span>{message || `표시 중 ${visibleItems.length}건`}</span>
        <button className="ghost-button" onClick={resetHidden} type="button">
          숨김 초기화
        </button>
      </div>

      <div className="cafe-result-grid">
        {visibleItems.slice(0, 24).map((item, index) => (
          <article className="cafe-result-card" key={`${item.link}-${index}`}>
            <div className="cafe-result-meta">
              <span className="pill">{item.category}</span>
              <small>{item.targetCafe?.name ?? item.cafename}</small>
            </div>
            <a href={item.link} target="_blank" rel="noreferrer">
              {item.title}
              <ExternalLink size={15} aria-hidden="true" />
            </a>
            <p>{item.description}</p>
            <div className="card-actions">
              <em>{item.keyword ?? query}</em>
              <button
                className={savedLinks.has(item.link) ? "tiny-button is-active" : "tiny-button"}
                onClick={() => toggleSaved(item.link)}
                title="저장"
                type="button"
              >
                <Star size={14} aria-hidden="true" />
              </button>
              <button
                className="tiny-button"
                onClick={() => hideResult(item.link)}
                title="숨김"
                type="button"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
