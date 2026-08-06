"use client";

// 용품 보드. 각 항목의 "용도(why)"와 "안 사거나 잘못 사면 생기는 문제(risk)"를
// 가격보다 먼저 보여주는 게 목적이다. 구매 상태는 localStorage에 저장한다.

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Filter, ShoppingCart } from "lucide-react";
import { gearItems, PRIORITY_SLUG, type GearChannel, type GearPriority } from "@/data/ownership";

const STORE_KEY = "my-tesla-gear-v1";

// 구매 진행 상태. 순서대로 눌러서 넘긴다.
const STATES = ["미정", "살 것", "주문함", "도착", "장착완료", "안 삼"] as const;
type GearState = (typeof STATES)[number];

const STATE_SLUG: Record<GearState, string> = {
  미정: "none",
  "살 것": "planned",
  주문함: "ordered",
  도착: "arrived",
  장착완료: "installed",
  "안 삼": "skipped"
};

const PRIORITY_ORDER: GearPriority[] = ["필수", "권장", "선택", "보류"];
const CHANNELS: GearChannel[] = ["알리", "국내", "공식몰", "시공"];

function loadStates(): Record<string, GearState> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORE_KEY) ?? "{}");
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function GearBoard() {
  const [states, setStates] = useState<Record<string, GearState>>({});
  const [priorityFilter, setPriorityFilter] = useState<GearPriority | "전체">("전체");
  const [channelFilter, setChannelFilter] = useState<GearChannel | "전체">("전체");

  useEffect(() => {
    setStates(loadStates());
  }, []);

  function cycleState(id: string) {
    const current = states[id] ?? "미정";
    const next = STATES[(STATES.indexOf(current) + 1) % STATES.length];
    const updated = { ...states, [id]: next };
    setStates(updated);
    window.localStorage.setItem(STORE_KEY, JSON.stringify(updated));
  }

  const filtered = useMemo(
    () =>
      gearItems.filter(
        (item) =>
          (priorityFilter === "전체" || item.priority === priorityFilter) &&
          (channelFilter === "전체" || item.channel === channelFilter)
      ),
    [priorityFilter, channelFilter]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof gearItems>();
    for (const item of filtered) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return [...map.entries()];
  }, [filtered]);

  const counts = useMemo(() => {
    const decided = gearItems.filter((item) => {
      const state = states[item.id] ?? "미정";
      return state !== "미정";
    }).length;
    const bought = gearItems.filter((item) =>
      ["주문함", "도착", "장착완료"].includes(states[item.id] ?? "미정")
    ).length;
    const mustLeft = gearItems.filter(
      (item) =>
        item.priority === "필수" &&
        !["주문함", "도착", "장착완료", "안 삼"].includes(states[item.id] ?? "미정")
    ).length;
    return { decided, bought, mustLeft, total: gearItems.length };
  }, [states]);

  return (
    <div className="gear-board">
      <div className="gear-summary">
        <article>
          <span>필수 중 미처리</span>
          <strong>{counts.mustLeft}</strong>
          <small>가격보다 배송 기간이 병목이다. 알리는 2~4주 걸린다</small>
        </article>
        <article>
          <span>구매 진행</span>
          <strong>{counts.bought}</strong>
          <small>주문함 · 도착 · 장착완료 합계</small>
        </article>
        <article>
          <span>판단 완료</span>
          <strong>
            {counts.decided}
            <em>/{counts.total}</em>
          </strong>
          <small>카드의 상태 배지를 누르면 단계가 넘어간다</small>
        </article>
      </div>

      <div className="gear-filters">
        <Filter size={15} aria-hidden="true" />
        <div className="gear-filter-group">
          <button
            className={priorityFilter === "전체" ? "is-active" : ""}
            onClick={() => setPriorityFilter("전체")}
            type="button"
          >
            전체
          </button>
          {PRIORITY_ORDER.map((priority) => (
            <button
              className={priorityFilter === priority ? "is-active" : ""}
              key={priority}
              onClick={() => setPriorityFilter(priority)}
              type="button"
            >
              {priority}
            </button>
          ))}
        </div>
        <div className="gear-filter-group">
          <button
            className={channelFilter === "전체" ? "is-active" : ""}
            onClick={() => setChannelFilter("전체")}
            type="button"
          >
            전체 채널
          </button>
          {CHANNELS.map((channel) => (
            <button
              className={channelFilter === channel ? "is-active" : ""}
              key={channel}
              onClick={() => setChannelFilter(channel)}
              type="button"
            >
              {channel}
            </button>
          ))}
        </div>
      </div>

      {grouped.map(([category, items]) => (
        <section className="gear-group" key={category}>
          <div className="gear-group-title">
            <strong>{category}</strong>
            <span>{items.length}개</span>
          </div>
          <div className="gear-grid">
            {items.map((item) => {
              const state = states[item.id] ?? "미정";
              return (
                <article
                  className={`gear-card priority-${PRIORITY_SLUG[item.priority]} state-${STATE_SLUG[state]}`}
                  key={item.id}
                >
                  <div className="gear-card-head">
                    <span className={`pill gear-priority priority-${PRIORITY_SLUG[item.priority]}`}>
                      {item.priority}
                    </span>
                    <span className="gear-channel">{item.channel}</span>
                    <button
                      className={`gear-state state-${STATE_SLUG[state]}`}
                      onClick={() => cycleState(item.id)}
                      type="button"
                      title="누를 때마다 미정 → 살 것 → 주문함 → 도착 → 장착완료 → 안 삼 순서로 바뀐다"
                    >
                      {state}
                    </button>
                  </div>

                  <strong className="gear-name">{item.name}</strong>

                  <p className="gear-why">
                    <em>용도</em>
                    {item.why}
                  </p>
                  <p className="gear-risk">
                    <em>주의</em>
                    {item.risk}
                  </p>

                  <div className="gear-card-foot">
                    <span className="gear-price">{item.price}</span>
                    <span className="gear-timing">{item.timing}</span>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noreferrer">
                        찾아보기
                        <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <p className="source-note">
        <ShoppingCart size={13} aria-hidden="true" /> 용도·주의사항은 docs/ali-accessories.md의
        2026-07-03 커뮤니티 조사(클리앙·주차몽·서버트릭스·EVBASE 등 교차 확인)를 정리한 것이다.
        가격은 시점·셀러·행사에 따라 변동이 커서 범위 추정치이고, 실제 시세는 구매 시점에 &ldquo;Model
        Y Juniper 2025/2026&rdquo; 키워드로 다시 확인하는 게 맞다. 구매 상태는 이 브라우저에만 저장된다.
      </p>
    </div>
  );
}
