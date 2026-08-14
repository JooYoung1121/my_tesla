"use client";

// 준비물 탭.
// 목록보다 구매 원칙이 먼저다 — "미리 사지 마라"가 커뮤니티 다수 의견이고,
// 목록은 그 원칙의 예외를 추린 결과다.

import { useMemo, useState } from "react";
import { ExternalLink, Filter, Info } from "lucide-react";
import { buyingRule, gearItems, PRIORITY_SLUG, type GearPriority } from "@/data/gear";

const PRIORITIES: GearPriority[] = ["필수", "권장", "나중에"];

export function GearBoard() {
  const [priority, setPriority] = useState<GearPriority | "전체">("전체");

  const categories = useMemo(() => {
    const filtered = priority === "전체" ? gearItems : gearItems.filter((item) => item.priority === priority);
    const grouped = new Map<string, typeof gearItems>();
    for (const item of filtered) {
      const bucket = grouped.get(item.category) ?? [];
      bucket.push(item);
      grouped.set(item.category, bucket);
    }
    return [...grouped.entries()];
  }, [priority]);

  const counts = useMemo(
    () =>
      PRIORITIES.map((level) => ({
        level,
        count: gearItems.filter((item) => item.priority === level).length
      })),
    []
  );

  return (
    <div className="gear-board">
      <div className="buying-rule">
        <Info size={18} aria-hidden="true" />
        <div>
          <strong>{buyingRule.headline}</strong>
          <p>{buyingRule.body}</p>
        </div>
      </div>

      <div className="gear-summary">
        {counts.map((entry) => (
          <article key={entry.level} className={`priority-${PRIORITY_SLUG[entry.level]}`}>
            <span>{entry.level}</span>
            <strong>
              {entry.count}
              <em>종</em>
            </strong>
          </article>
        ))}
      </div>

      <div className="gear-filters">
        <Filter size={14} aria-hidden="true" />
        <div className="gear-filter-group">
          {(["전체", ...PRIORITIES] as Array<GearPriority | "전체">).map((level) => (
            <button
              key={level}
              type="button"
              className={priority === level ? "is-active" : ""}
              onClick={() => setPriority(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {categories.map(([category, items]) => (
        <section key={category}>
          <h4 className="gear-group-title">{category}</h4>
          <div className="gear-grid">
            {items.map((item) => (
              <article className={`gear-card priority-${PRIORITY_SLUG[item.priority]}`} key={item.id}>
                <div className="gear-card-head">
                  <span className={`pill gear-priority priority-${PRIORITY_SLUG[item.priority]}`}>
                    {item.priority}
                  </span>
                  <span className="gear-channel">{item.channel}</span>
                </div>
                {item.url ? (
                  <a className="gear-name" href={item.url} target="_blank" rel="noreferrer">
                    {item.name}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                ) : (
                  <span className="gear-name">{item.name}</span>
                )}
                <p className="gear-why">{item.why}</p>
                <p className="gear-risk">{item.risk}</p>
                <div className="gear-foot">
                  <span>{item.price}</span>
                  <em>{item.timing}</em>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <p className="source-note">
        근거: <code>docs/ali-accessories.md</code>(2026-07-03 커뮤니티 조사). 가격은 전부 범위 추정치이고, 알리 배송은
        2~4주로 잡아야 한다. 주니퍼(2025~) 전용 여부를 상품 사진으로 반드시 확인할 것 — 구형 Model Y용은 화면 크기와
        송풍구 형상이 달라 물리적으로 안 맞는다.
      </p>
    </div>
  );
}
