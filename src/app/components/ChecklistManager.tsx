"use client";

import { Check, Plus, Trash2, type LucideIcon } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { deliveryChecklist } from "@/data/home";

// 인수 후 오너 체크리스트와 아카이브의 인수 전 체크리스트가 같은 UI를 쓴다.
// groups와 storeKey를 갈아끼우면 서로 다른 목록이 서로 다른 저장소에 남는다.
export type ChecklistGroup = {
  phase: string;
  summary: string;
  icon: LucideIcon;
  items: ReadonlyArray<{ text: string; status: string }>;
};

type ItemState = {
  done: boolean;
  memo: string;
};

type CustomItem = {
  id: string;
  phase: string;
  text: string;
  memo: string;
  done: boolean;
};

type ChecklistStore = {
  states: Record<string, ItemState>;
  customItems: CustomItem[];
};

export const LEGACY_CHECKLIST_STORE_KEY = "my-tesla-checklist-v1";

function itemId(phase: string, text: string) {
  return `${phase}::${text}`;
}

function defaultDone(status: string) {
  return status === "완료";
}

function loadStore(storeKey: string): ChecklistStore {
  if (typeof window === "undefined") return { states: {}, customItems: [] };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storeKey) ?? "{}");
    return {
      states: parsed.states ?? {},
      customItems: Array.isArray(parsed.customItems) ? parsed.customItems : []
    };
  } catch {
    return { states: {}, customItems: [] };
  }
}

function saveStore(storeKey: string, store: ChecklistStore) {
  window.localStorage.setItem(storeKey, JSON.stringify(store));
}

export function ChecklistManager({
  groups = deliveryChecklist,
  storeKey = LEGACY_CHECKLIST_STORE_KEY,
  changeEvent
}: {
  groups?: ChecklistGroup[];
  storeKey?: string;
  changeEvent?: string; // 완료율이 바뀔 때 window에 쏘는 이벤트 이름(오늘 탭 갱신용)
} = {}) {
  const deliveryChecklistGroups = groups;
  const [store, setStore] = useState<ChecklistStore>({ states: {}, customItems: [] });
  const [newPhase, setNewPhase] = useState(deliveryChecklistGroups[0]?.phase ?? "");
  const [newText, setNewText] = useState("");
  const [openPhases, setOpenPhases] = useState<Set<string>>(
    () => new Set(deliveryChecklistGroups[0]?.phase ? [deliveryChecklistGroups[0].phase] : [])
  );

  useEffect(() => {
    setStore(loadStore(storeKey));
  }, [storeKey]);

  const totals = useMemo(() => {
    const defaultItems = deliveryChecklistGroups.flatMap((group) =>
      group.items.map((item) => {
        const id = itemId(group.phase, item.text);
        const stored = store.states[id];
        return stored?.done ?? defaultDone(item.status);
      })
    );
    const customDone = store.customItems.map((item) => item.done);
    const all = [...defaultItems, ...customDone];
    const done = all.filter(Boolean).length;
    return { done, total: all.length, percent: all.length ? Math.round((done / all.length) * 100) : 0 };
  }, [store, deliveryChecklistGroups]);

  function updateStore(next: ChecklistStore) {
    setStore(next);
    saveStore(storeKey, next);
    // 오늘 탭의 준비율 타일이 같은 화면에 없어도 다음 진입 때 바로 반영되도록 알린다.
    if (changeEvent) window.dispatchEvent(new CustomEvent(changeEvent));
  }

  function getItemDone(phase: string, text: string, fallbackStatus: string) {
    const id = itemId(phase, text);
    const stored = store.states[id];
    return stored?.done ?? defaultDone(fallbackStatus);
  }

  function getGroupStats(group: ChecklistGroup) {
    const defaultDoneCount = group.items.filter((item) =>
      getItemDone(group.phase, item.text, item.status)
    ).length;
    const customItems = store.customItems.filter((item) => item.phase === group.phase);
    const customDoneCount = customItems.filter((item) => item.done).length;
    const done = defaultDoneCount + customDoneCount;
    const total = group.items.length + customItems.length;
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
  }

  function togglePhase(phase: string) {
    setOpenPhases((previous) => {
      const next = new Set(previous);
      if (next.has(phase)) {
        next.delete(phase);
      } else {
        next.add(phase);
      }
      return next;
    });
  }

  function focusPhase(phase: string) {
    setOpenPhases(new Set([phase]));
    setNewPhase(phase);
  }

  function expandAll() {
    setOpenPhases(new Set(deliveryChecklistGroups.map((group) => group.phase)));
  }

  function collapseAll() {
    setOpenPhases(new Set());
  }

  function toggleItem(phase: string, text: string, fallbackStatus: string) {
    const id = itemId(phase, text);
    const previous = store.states[id];
    const nextDone = !(previous?.done ?? defaultDone(fallbackStatus));
    updateStore({
      ...store,
      states: {
        ...store.states,
        [id]: {
          done: nextDone,
          memo: previous?.memo ?? ""
        }
      }
    });
  }

  function updateMemo(phase: string, text: string, fallbackStatus: string, memo: string) {
    const id = itemId(phase, text);
    const previous = store.states[id];
    updateStore({
      ...store,
      states: {
        ...store.states,
        [id]: {
          done: previous?.done ?? defaultDone(fallbackStatus),
          memo
        }
      }
    });
  }

  function addCustomItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanText = newText.trim();
    if (!cleanText) return;

    updateStore({
      ...store,
      customItems: [
        ...store.customItems,
        {
          id: crypto.randomUUID(),
          phase: newPhase,
          text: cleanText,
          memo: "",
          done: false
        }
      ]
    });
    setNewText("");
  }

  function toggleCustomItem(id: string) {
    updateStore({
      ...store,
      customItems: store.customItems.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    });
  }

  function updateCustomMemo(id: string, memo: string) {
    updateStore({
      ...store,
      customItems: store.customItems.map((item) =>
        item.id === id ? { ...item, memo } : item
      )
    });
  }

  function removeCustomItem(id: string) {
    updateStore({
      ...store,
      customItems: store.customItems.filter((item) => item.id !== id)
    });
  }

  return (
    <div className="checklist-manager">
      <div className="checklist-summary">
        <div>
          <p className="eyebrow">터치형 체크리스트</p>
          <h3>{totals.percent}% 완료</h3>
          <p>
            {totals.total}개 중 {totals.done}개 완료. 상태와 메모는 현재 브라우저에 저장된다.
          </p>
        </div>
        <div className="checklist-summary-side">
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${totals.percent}%` }} />
          </div>
          <div className="checklist-summary-actions">
            <button className="ghost-button" onClick={expandAll} type="button">
              전체 펼치기
            </button>
            <button className="ghost-button" onClick={collapseAll} type="button">
              접기
            </button>
          </div>
        </div>
      </div>

      <div className="checklist-roadmap" aria-label="인수 준비 단계">
        {deliveryChecklistGroups.map((group, index) => {
          const stats = getGroupStats(group);
          const isOpen = openPhases.has(group.phase);
          return (
            <button
              className={isOpen ? "is-active" : ""}
              key={group.phase}
              onClick={() => focusPhase(group.phase)}
              type="button"
            >
              <span>{index + 1}</span>
              <strong>{group.phase}</strong>
              <em>
                {stats.done}/{stats.total}
              </em>
            </button>
          );
        })}
      </div>

      <form className="add-check-form" onSubmit={addCustomItem}>
        <select value={newPhase} onChange={(event) => setNewPhase(event.target.value)}>
          {deliveryChecklistGroups.map((group) => (
            <option key={group.phase} value={group.phase}>
              {group.phase}
            </option>
          ))}
        </select>
        <input
          value={newText}
          onChange={(event) => setNewText(event.target.value)}
          placeholder="새 체크 항목"
        />
        <button className="primary-button">
          <Plus size={18} aria-hidden="true" />
          추가
        </button>
      </form>

      <div className="checklist-board" aria-label="상세 인수 준비 체크리스트">
        {deliveryChecklistGroups.map((group) => {
          const Icon = group.icon;
          const customItems = store.customItems.filter((item) => item.phase === group.phase);
          const stats = getGroupStats(group);
          const isOpen = openPhases.has(group.phase);
          return (
            <article className={isOpen ? "checklist-card is-open" : "checklist-card"} key={group.phase}>
              <button
                className="checklist-card-trigger"
                onClick={() => togglePhase(group.phase)}
                type="button"
                aria-expanded={isOpen}
              >
                <span className="checklist-card-icon">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <div>
                  <strong>{group.phase}</strong>
                  <p>{group.summary}</p>
                </div>
                <em>
                  {stats.done}/{stats.total}
                </em>
              </button>
              {isOpen ? (
                <ul className="checklist-items">
                  {group.items.map((item) => {
                    const id = itemId(group.phase, item.text);
                    const stored = store.states[id];
                    const done = getItemDone(group.phase, item.text, item.status);
                    return (
                      <li className={done ? "is-done" : ""} key={item.text}>
                        <button
                          className="check-toggle"
                          onClick={() => toggleItem(group.phase, item.text, item.status)}
                          title="완료 상태 변경"
                          type="button"
                        >
                          {done ? <Check size={14} aria-hidden="true" /> : null}
                        </button>
                        <span>{item.text}</span>
                        <em>{done ? "완료" : item.status === "완료" ? "대기" : item.status}</em>
                        <textarea
                          value={stored?.memo ?? ""}
                          onChange={(event) =>
                            updateMemo(group.phase, item.text, item.status, event.target.value)
                          }
                          placeholder="메모"
                        />
                      </li>
                    );
                  })}
                  {customItems.map((item) => (
                    <li className={item.done ? "is-done" : ""} key={item.id}>
                      <button
                        className="check-toggle"
                        onClick={() => toggleCustomItem(item.id)}
                        title="완료 상태 변경"
                        type="button"
                      >
                        {item.done ? <Check size={14} aria-hidden="true" /> : null}
                      </button>
                      <span>{item.text}</span>
                      <em>{item.done ? "완료" : "추가"}</em>
                      <textarea
                        value={item.memo}
                        onChange={(event) => updateCustomMemo(item.id, event.target.value)}
                        placeholder="메모"
                      />
                      <button
                        className="delete-check"
                        onClick={() => removeCustomItem(item.id)}
                        title="삭제"
                        type="button"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
