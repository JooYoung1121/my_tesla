"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

type Note = {
  id: string;
  title: string;
  category: string;
  body: string;
  link: string;
};

const STORE_KEY = "my-tesla-personal-notes-v1";

function loadNotes() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(notes));
}

export function PersonalNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState({ title: "", category: "메모", body: "", link: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  function updateNotes(next: Note[]) {
    setNotes(next);
    saveNotes(next);
  }

  function resetDraft() {
    setDraft({ title: "", category: "메모", body: "", link: "" });
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) return;

    if (editingId) {
      updateNotes(
        notes.map((note) =>
          note.id === editingId ? { ...note, ...draft, title } : note
        )
      );
      resetDraft();
      return;
    }

    updateNotes([
      {
        id: crypto.randomUUID(),
        title,
        category: draft.category.trim() || "메모",
        body: draft.body.trim(),
        link: draft.link.trim()
      },
      ...notes
    ]);
    resetDraft();
  }

  function editNote(note: Note) {
    setEditingId(note.id);
    setDraft({
      title: note.title,
      category: note.category,
      body: note.body,
      link: note.link
    });
  }

  function removeNote(id: string) {
    updateNotes(notes.filter((note) => note.id !== id));
    if (editingId === id) resetDraft();
  }

  return (
    <section className="section-band" id="my-notes">
      <div className="section-heading">
        <div>
          <p className="eyebrow">내 편집 공간</p>
          <h2>직접 수정하는 메모와 링크</h2>
        </div>
      </div>

      <form className="note-form" onSubmit={handleSubmit}>
        <input
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          placeholder="제목"
        />
        <input
          value={draft.category}
          onChange={(event) => setDraft({ ...draft, category: event.target.value })}
          placeholder="분류"
        />
        <input
          value={draft.link}
          onChange={(event) => setDraft({ ...draft, link: event.target.value })}
          placeholder="링크"
        />
        <textarea
          value={draft.body}
          onChange={(event) => setDraft({ ...draft, body: event.target.value })}
          placeholder="내용"
        />
        <button className="primary-button">
          <Plus size={18} aria-hidden="true" />
          {editingId ? "수정 저장" : "메모 추가"}
        </button>
        {editingId ? (
          <button className="ghost-button" onClick={resetDraft} type="button">
            취소
          </button>
        ) : null}
      </form>

      <div className="note-grid">
        {notes.length === 0 ? (
          <p className="empty-note">아직 저장한 메모가 없다.</p>
        ) : null}
        {notes.map((note) => (
          <article className="note-card" key={note.id}>
            <span>{note.category}</span>
            <strong>{note.title}</strong>
            <p>{note.body}</p>
            <div className="note-actions">
              {note.link ? (
                <a href={note.link} target="_blank" rel="noreferrer">
                  링크 열기
                </a>
              ) : null}
              <button className="tiny-button" onClick={() => editNote(note)} title="수정">
                <Pencil size={14} aria-hidden="true" />
              </button>
              <button className="tiny-button" onClick={() => removeNote(note.id)} title="삭제">
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
