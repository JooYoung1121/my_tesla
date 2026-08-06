"use client";

// 인수 전후 일정 보드.
//  - 기본 일정은 data/ownership.ts의 scheduleSeed에서 가져오고,
//    추가·수정·삭제 결과는 localStorage에 저장한다(브라우저 단위).
//  - .ics 내보내기는 RFC 5545 최소 형태로 직접 만든다. 종일 일정은 VALUE=DATE,
//    시각 지정 일정은 타임존 없는 floating time으로 내보내 캘린더 앱이
//    기기 로컬 시간(= KST)으로 해석하게 한다.

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  RotateCcw,
  Trash2
} from "lucide-react";
import { KIND_SLUG, ownership, scheduleSeed, type ScheduleKind } from "@/data/ownership";

export const SCHEDULE_STORE_KEY = "my-tesla-schedule-v1";

type ScheduleEvent = {
  id: string;
  date: string | null;
  time: string | null;
  title: string;
  kind: ScheduleKind;
  note: string;
  done: boolean;
};

const KINDS: ScheduleKind[] = ["인수", "수령", "예약", "할일", "정기"];
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const emptyDraft = {
  id: "",
  date: "",
  time: "",
  title: "",
  kind: "할일" as ScheduleKind,
  note: ""
};

function seedEvents(): ScheduleEvent[] {
  return scheduleSeed.map((event) => ({ ...event, done: false }));
}

function loadEvents(): ScheduleEvent[] {
  if (typeof window === "undefined") return seedEvents();
  try {
    const raw = window.localStorage.getItem(SCHEDULE_STORE_KEY);
    if (!raw) return seedEvents();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.events) ? parsed.events : seedEvents();
  } catch {
    return seedEvents();
  }
}

function saveEvents(events: ScheduleEvent[]) {
  window.localStorage.setItem(SCHEDULE_STORE_KEY, JSON.stringify({ events }));
}

// ── 날짜 유틸 ──────────────────────────────────────────────────────────
function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

function diffDays(fromISO: string, toISO: string) {
  const a = new Date(`${fromISO}T00:00:00`);
  const b = new Date(`${toISO}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function fmtDay(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getMonth() + 1}.${d.getDate()}(${WEEKDAYS[d.getDay()]})`;
}

function ddayLabel(days: number) {
  if (days === 0) return "오늘";
  if (days > 0) return `D-${days}`;
  return `${-days}일 지남`;
}

// ── .ics 생성 ──────────────────────────────────────────────────────────
function escapeICS(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

// RFC 5545는 한 줄 75옥텟 제한이 있어 넘치면 접어야 한다. 한글은 UTF-8 3바이트라
// 문자 수가 아니라 바이트 기준으로 잘라야 안전하다.
function foldLine(line: string) {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 73) return line;

  const parts: string[] = [];
  let current = "";
  let currentBytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (currentBytes + size > 73) {
      parts.push(current);
      current = char;
      currentBytes = size;
    } else {
      current += char;
      currentBytes += size;
    }
  }
  if (current) parts.push(current);
  return parts.join("\r\n ");
}

function toICSDate(iso: string) {
  return iso.replace(/-/g, "");
}

function nextDayISO(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function buildICS(events: ScheduleEvent[]) {
  const stamp = `${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//my-tesla//owner schedule//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  for (const event of events) {
    if (!event.date) continue;
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}@my-tesla`);
    lines.push(`DTSTAMP:${stamp}`);
    if (event.time) {
      // 타임존 지정 없는 floating time — 캘린더 앱이 기기 로컬 시간으로 읽는다.
      const start = `${toICSDate(event.date)}T${event.time.replace(":", "")}00`;
      const endHour = String((Number(event.time.slice(0, 2)) + 1) % 24).padStart(2, "0");
      lines.push(`DTSTART:${start}`);
      lines.push(`DTEND:${toICSDate(event.date)}T${endHour}${event.time.slice(3, 5)}00`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${toICSDate(event.date)}`);
      lines.push(`DTEND;VALUE=DATE:${toICSDate(nextDayISO(event.date))}`);
    }
    lines.push(foldLine(`SUMMARY:${escapeICS(`[${event.kind}] ${event.title}`)}`));
    if (event.note) lines.push(foldLine(`DESCRIPTION:${escapeICS(event.note)}`));
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadICS(events: ScheduleEvent[], filename: string) {
  const blob = new Blob([buildICS(events)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

// ── 월 그리드 ──────────────────────────────────────────────────────────
function buildMonthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ iso: string; day: number } | null> = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      iso: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      day
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function ScheduleBoard() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [today, setToday] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => {
    const base = new Date(`${ownership.deliveryDate}T00:00:00`);
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setEvents(loadEvents());
    setToday(todayISO());
  }, []);

  function update(next: ScheduleEvent[]) {
    setEvents(next);
    saveEvents(next);
  }

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    for (const event of events) {
      if (!event.date) continue;
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [events]);

  const undated = events.filter((event) => !event.date);

  const upcoming = useMemo(() => {
    if (!today) return [];
    return events
      .filter((event) => event.date && event.date >= today && !event.done)
      .sort((a, b) => (a.date! < b.date! ? -1 : 1))
      .slice(0, 6);
  }, [events, today]);

  const overdue = useMemo(() => {
    if (!today) return [];
    return events
      .filter((event) => event.date && event.date < today && !event.done)
      .sort((a, b) => (a.date! < b.date! ? 1 : -1));
  }, [events, today]);

  const cells = buildMonthCells(cursor.year, cursor.month);
  const selectedEvents = selected ? (byDate.get(selected) ?? []) : [];

  function moveMonth(delta: number) {
    setCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
    setSelected(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) return;

    const payload = {
      date: draft.date || null,
      time: draft.time || null,
      title,
      kind: draft.kind,
      note: draft.note.trim()
    };

    if (editingId) {
      update(events.map((item) => (item.id === editingId ? { ...item, ...payload } : item)));
    } else {
      update([...events, { id: crypto.randomUUID(), done: false, ...payload }]);
    }
    setDraft(emptyDraft);
    setEditingId(null);
  }

  function startEdit(event: ScheduleEvent) {
    setEditingId(event.id);
    setDraft({
      id: event.id,
      date: event.date ?? "",
      time: event.time ?? "",
      title: event.title,
      kind: event.kind,
      note: event.note
    });
    if (event.date) {
      const base = new Date(`${event.date}T00:00:00`);
      setCursor({ year: base.getFullYear(), month: base.getMonth() });
    }
  }

  function toggleDone(id: string) {
    update(events.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  }

  function remove(id: string) {
    update(events.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setDraft(emptyDraft);
    }
  }

  function setUndatedDate(id: string, date: string) {
    if (!date) return;
    update(events.map((item) => (item.id === id ? { ...item, date } : item)));
  }

  function restoreSeed() {
    // 기본 일정만 되살린다. 직접 추가한 항목(시드 id가 아닌 것)은 유지한다.
    const seedIds = new Set(scheduleSeed.map((event) => event.id));
    const custom = events.filter((event) => !seedIds.has(event.id));
    update([...seedEvents(), ...custom]);
  }

  return (
    <div className="schedule-board">
      <div className="schedule-toolbar">
        <div className="mini-heading">
          <p className="eyebrow">일정</p>
          <h3>인수 전후 캘린더</h3>
        </div>
        <div className="schedule-toolbar-actions">
          <button
            className="ghost-button"
            type="button"
            onClick={() => downloadICS(events, "my-tesla-schedule.ics")}
            title="전체 일정을 .ics 파일로 내려받아 아이폰·구글 캘린더에 넣는다"
          >
            <Download size={15} aria-hidden="true" />
            전체 ics 내보내기
          </button>
          <button
            className="ghost-button"
            type="button"
            onClick={restoreSeed}
            title="기본 일정을 다시 불러온다. 직접 추가한 일정은 유지된다"
          >
            <RotateCcw size={15} aria-hidden="true" />
            기본 일정 복원
          </button>
        </div>
      </div>

      {overdue.length > 0 ? (
        <div className="schedule-overdue">
          <strong>지난 일정 {overdue.length}건이 아직 완료 표시가 안 됐다</strong>
          <div>
            {overdue.slice(0, 4).map((event) => (
              <button key={event.id} type="button" onClick={() => toggleDone(event.id)}>
                {fmtDay(event.date!)} {event.title}
                <em>완료 처리</em>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="schedule-layout">
        <div className="schedule-calendar">
          <div className="schedule-month-head">
            <button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달">
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <strong>
              {cursor.year}년 {cursor.month + 1}월
            </strong>
            <button type="button" onClick={() => moveMonth(1)} aria-label="다음 달">
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="schedule-weekdays" aria-hidden="true">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="schedule-grid" role="grid">
            {cells.map((cell, index) => {
              if (!cell) return <span className="schedule-cell is-empty" key={`empty-${index}`} />;
              const dayEvents = byDate.get(cell.iso) ?? [];
              const isToday = today === cell.iso;
              const isDelivery = cell.iso === ownership.deliveryDate;
              const isHandover = cell.iso === ownership.handoverDate;
              const classes = [
                "schedule-cell",
                isToday ? "is-today" : "",
                isDelivery ? "is-delivery" : "",
                isHandover ? "is-handover" : "",
                selected === cell.iso ? "is-selected" : "",
                dayEvents.length > 0 ? "has-events" : ""
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  className={classes}
                  key={cell.iso}
                  type="button"
                  onClick={() => setSelected(selected === cell.iso ? null : cell.iso)}
                >
                  <span className="schedule-cell-day">{cell.day}</span>
                  {isDelivery ? <span className="schedule-cell-flag">인수</span> : null}
                  {isHandover ? <span className="schedule-cell-flag">수령</span> : null}
                  <span className="schedule-cell-dots">
                    {dayEvents.slice(0, 4).map((event) => (
                      <i
                        key={event.id}
                        className={`schedule-dot kind-${KIND_SLUG[event.kind]}${event.done ? " is-done" : ""}`}
                        title={event.title}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="schedule-legend">
            {KINDS.map((kind) => (
              <span key={kind}>
                <i className={`schedule-dot kind-${KIND_SLUG[kind]}`} aria-hidden="true" />
                {kind}
              </span>
            ))}
            <span className="schedule-legend-hint">날짜를 누르면 그날 일정만 아래에 뜬다</span>
          </div>
        </div>

        <div className="schedule-side">
          <div className="schedule-list-head">
            <strong>{selected ? `${fmtDay(selected)} 일정` : "다가오는 일정"}</strong>
            {selected ? (
              <button className="tiny-button" type="button" onClick={() => setSelected(null)}>
                전체 보기
              </button>
            ) : null}
          </div>

          <div className="schedule-list">
            {(selected ? selectedEvents : upcoming).length === 0 ? (
              <p className="empty-note">
                {selected ? "이 날짜에 등록된 일정이 없다." : "남은 일정이 없다."}
              </p>
            ) : null}
            {(selected ? selectedEvents : upcoming).map((event) => (
              <article
                className={`schedule-item kind-${KIND_SLUG[event.kind]}${event.done ? " is-done" : ""}`}
                key={event.id}
              >
                <button
                  className="check-toggle"
                  type="button"
                  onClick={() => toggleDone(event.id)}
                  title="완료 상태 변경"
                >
                  {event.done ? <Check size={13} aria-hidden="true" /> : null}
                </button>
                <div className="schedule-item-body">
                  <div className="schedule-item-top">
                    <strong>{event.title}</strong>
                    <span className={`pill schedule-kind kind-${KIND_SLUG[event.kind]}`}>{event.kind}</span>
                  </div>
                  <span className="schedule-item-when">
                    {event.date ? fmtDay(event.date) : "날짜 미정"}
                    {event.time ? ` ${event.time}` : ""}
                    {event.date && today ? (
                      <em> · {ddayLabel(diffDays(today, event.date))}</em>
                    ) : null}
                  </span>
                  {event.note ? <p>{event.note}</p> : null}
                </div>
                <div className="schedule-item-actions">
                  {event.date ? (
                    <button
                      className="tiny-button"
                      type="button"
                      onClick={() => downloadICS([event], `${event.title}.ics`)}
                      title="이 일정만 캘린더에 추가"
                    >
                      <CalendarPlus size={13} aria-hidden="true" />
                    </button>
                  ) : null}
                  <button
                    className="tiny-button"
                    type="button"
                    onClick={() => startEdit(event)}
                    title="수정"
                  >
                    <Pencil size={13} aria-hidden="true" />
                  </button>
                  <button
                    className="tiny-button"
                    type="button"
                    onClick={() => remove(event.id)}
                    title="삭제"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {undated.length > 0 ? (
        <div className="schedule-undated">
          <div className="mini-heading">
            <p className="eyebrow">날짜 확정 필요</p>
            <h3>날짜만 넣으면 캘린더에 붙는다</h3>
          </div>
          {undated.map((event) => (
            <div className="schedule-undated-row" key={event.id}>
              <div>
                <strong>{event.title}</strong>
                {event.note ? <p>{event.note}</p> : null}
              </div>
              <input
                type="date"
                onChange={(changeEvent) => setUndatedDate(event.id, changeEvent.target.value)}
                aria-label={`${event.title} 날짜 지정`}
              />
            </div>
          ))}
        </div>
      ) : null}

      <form className="schedule-form" onSubmit={submit}>
        <div className="schedule-form-head">
          <CalendarDays size={16} aria-hidden="true" />
          <strong>{editingId ? "일정 수정" : "일정 추가"}</strong>
          {editingId ? (
            <button
              className="tiny-button"
              type="button"
              onClick={() => {
                setEditingId(null);
                setDraft(emptyDraft);
              }}
            >
              취소
            </button>
          ) : null}
        </div>
        <div className="schedule-form-row">
          <input
            type="date"
            value={draft.date}
            onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            aria-label="날짜"
          />
          <input
            type="time"
            value={draft.time}
            onChange={(event) => setDraft({ ...draft, time: event.target.value })}
            aria-label="시각 (비우면 종일)"
          />
          <select
            value={draft.kind}
            onChange={(event) => setDraft({ ...draft, kind: event.target.value as ScheduleKind })}
            aria-label="분류"
          >
            {KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </div>
        <input
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          placeholder="일정 제목"
          aria-label="제목"
        />
        <textarea
          value={draft.note}
          onChange={(event) => setDraft({ ...draft, note: event.target.value })}
          placeholder="메모 (선택)"
          aria-label="메모"
        />
        <button className="primary-button" type="submit">
          <CalendarPlus size={16} aria-hidden="true" />
          {editingId ? "저장" : "추가"}
        </button>
      </form>

      <p className="source-note">
        일정은 이 브라우저에만 저장된다(localStorage). 다른 기기에서도 보려면 ics로 내보내
        캘린더 앱에 넣는 방식을 쓴다. 시각을 지정한 일정은 타임존 없이 내보내므로 캘린더 앱이
        기기 로컬 시간(한국이면 KST)으로 읽는다.
      </p>
    </div>
  );
}
