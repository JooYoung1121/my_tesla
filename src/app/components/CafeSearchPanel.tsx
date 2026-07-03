"use client";

import { ExternalLink, RotateCcw, Search, Star, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
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
const CATEGORY_ORDER = ["입항·배정", "인수", "썬팅", "PPF", "블랙박스", "보험", "보조금", "충전", "액세서리", "기타"];

function inferCategory(item: Partial<CafeResult>, fallbackKeyword: string) {
  const text = `${fallbackKeyword} ${item.title ?? ""} ${item.description ?? ""}`;
  if (/ppf|생활보호|도어컵|도어엣지/i.test(text)) return "PPF";
  if (/썬팅|틴팅|필름|버텍스|레이노|브이쿨|농도/i.test(text)) return "썬팅";
  if (/블랙박스|보조배터리|센트리/i.test(text)) return "블랙박스";
  if (/보험|특약|자차|자기부담금/i.test(text)) return "보험";
  if (/보조금|취득세|등록비|지방비/i.test(text)) return "보조금";
  if (/충전|충전카드|슈퍼차저|집밥|어댑터|커넥터/i.test(text)) return "충전";
  if (/알리|악세사리|액세서리|매트|선쉐이드|하이패스|거치대|수납|머드플랩/i.test(text)) return "액세서리";
  if (/입항|선적|평택|글로비스|VIN|배정|탁송/i.test(text)) return "입항·배정";
  if (/인수|출고|검수|체크/i.test(text)) return "인수";
  return "기타";
}

function categoryRank(category: string) {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

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

const initialItems = naverCafeResults as unknown as CafeResult[];

export function CafeSearchPanel() {
  const [query, setQuery] = useState("모델Y 썬팅");
  const [items, setItems] = useState<CafeResult[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialData, setIsInitialData] = useState(true);
  const [message, setMessage] = useState("");
  const [savedLinks, setSavedLinks] = useState<Set<string>>(new Set());
  const [hiddenLinks, setHiddenLinks] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState("전체");
  const resultCache = useRef(new Map<string, CafeResult[]>());
  const abortRef = useRef<AbortController | null>(null);
  const requestSeq = useRef(0);

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

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => !hiddenLinks.has(item.link))
      .slice()
      .sort((a, b) => categoryRank(a.category) - categoryRank(b.category));
  }, [hiddenLinks, items]);

  const groupedItems = useMemo(() => {
    const categoryItems = activeCategory === "전체"
      ? visibleItems
      : visibleItems.filter((item) => item.category === activeCategory);

    return Array.from(
      categoryItems.reduce((map, item) => {
        const group = map.get(item.category) ?? [];
        group.push(item);
        map.set(item.category, group);
        return map;
      }, new Map<string, CafeResult[]>())
    );
  }, [activeCategory, visibleItems]);

  const counts = useMemo(() => {
    return Array.from(
      visibleItems.reduce((map, item) => {
        map.set(item.category, (map.get(item.category) ?? 0) + 1);
        return map;
      }, new Map<string, number>())
    );
  }, [visibleItems]);

  const categoryTabs = useMemo(() => ["전체", ...counts.map(([category]) => category)], [counts]);

  const activeCount = activeCategory === "전체"
    ? visibleItems.length
    : visibleItems.filter((item) => item.category === activeCategory).length;

  async function runSearch(nextQuery = query) {
    const cleanQuery = nextQuery.trim();
    if (!cleanQuery) return;

    setQuery(cleanQuery);
    setActiveCategory("전체");

    const cached = resultCache.current.get(cleanQuery);
    if (cached) {
      abortRef.current?.abort();
      requestSeq.current += 1;
      setIsLoading(false);
      setItems(cached);
      setIsInitialData(false);
      setMessage(`${cleanQuery} 검색 결과 ${cached.length}건 (캐시)`);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const seq = (requestSeq.current += 1);

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/naver/cafe-search?query=${encodeURIComponent(cleanQuery)}&display=30`,
        { signal: controller.signal }
      );
      const payload = await response.json();

      if (seq !== requestSeq.current) return;

      if (!response.ok) {
        throw new Error(payload.error ?? "검색에 실패했습니다.");
      }

      const nextItems = ((payload.items ?? []) as CafeResult[]).map((item) => ({
        ...item,
        category: item.category ?? inferCategory(item, cleanQuery),
        keyword: cleanQuery
      }));
      resultCache.current.set(cleanQuery, nextItems);
      setItems(nextItems);
      setIsInitialData(false);
      setMessage(`${cleanQuery} 검색 결과 ${nextItems.length}건`);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (seq !== requestSeq.current) return;
      setMessage(error instanceof Error ? error.message : "검색에 실패했습니다.");
    } finally {
      if (seq === requestSeq.current) {
        setIsLoading(false);
      }
    }
  }

  function restoreInitialData() {
    abortRef.current?.abort();
    requestSeq.current += 1;
    setIsLoading(false);
    setItems(initialItems);
    setIsInitialData(true);
    setActiveCategory("전체");
    setMessage("");
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
            className={!isInitialData && keyword === query ? "keyword-button is-active" : "keyword-button"}
            key={keyword}
            onClick={() => void runSearch(keyword)}
            type="button"
          >
            {keyword}
          </button>
        ))}
      </div>

      <div className="result-toolbar">
        <span>
          {isLoading
            ? "검색 중…"
            : message
              ? `${message} · ${activeCategory} ${activeCount}건 표시`
              : `${activeCategory} ${activeCount}건 표시`}
        </span>
        <div className="result-toolbar-actions">
          {!isInitialData ? (
            <button className="ghost-button" onClick={restoreInitialData} type="button">
              <RotateCcw size={14} aria-hidden="true" />
              수집 데이터로
            </button>
          ) : null}
          <button className="ghost-button" onClick={resetHidden} type="button">
            숨김 초기화
          </button>
        </div>
      </div>

      <div className="category-filter-tabs" aria-label="카페 검색 결과 필터">
        {categoryTabs.map((category) => {
          const count = category === "전체"
            ? visibleItems.length
            : counts.find(([name]) => name === category)?.[1] ?? 0;

          return (
            <button
              className={activeCategory === category ? "is-active" : ""}
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              <span>{category}</span>
              <strong>{count}</strong>
            </button>
          );
        })}
      </div>

      <div className={isLoading ? "cafe-category-sections is-loading" : "cafe-category-sections"}>
        {groupedItems.map(([category, categoryItems]) => (
          <section className="cafe-category-group" key={category}>
            <div className="cafe-category-title">
              <strong>{category}</strong>
              <span>{categoryItems.length}건</span>
            </div>
            <div className="cafe-result-grid">
              {categoryItems.map((item, index) => (
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
          </section>
        ))}
      </div>
    </div>
  );
}
