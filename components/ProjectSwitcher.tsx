"use client";

import { useState } from "react";
import { useProject } from "@/lib/project-context";
import { toDateKey, formatShortDate } from "@/lib/date";
import { FolderIcon, ChevronDownIcon, CheckIcon, EditIcon } from "@/components/icons";

const GENERAL_LABEL = "日常記帳";

export function ProjectSwitcher() {
  const {
    projects,
    currentProjectId,
    currentProject,
    loading,
    selectProject,
    createProject,
    updateProject,
  } = useProject();
  const [open, setOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newStart, setNewStart] = useState(() => toDateKey(new Date()));
  const [newEnd, setNewEnd] = useState(() => toDateKey(new Date()));
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function openSheet() {
    setOpen(true);
    setCreateError(null);
    setNewName("");
    setEditingId(null);
  }

  function handleNewStartChange(value: string) {
    setNewStart(value);
    if (value > newEnd) setNewEnd(value);
  }

  function handleNewEndChange(value: string) {
    setNewEnd(value);
    if (value < newStart) setNewStart(value);
  }

  function handleEditStartChange(value: string) {
    setEditStart(value);
    if (value > editEnd) setEditEnd(value);
  }

  function handleEditEndChange(value: string) {
    setEditEnd(value);
    if (value < editStart) setEditStart(value);
  }

  function startEdit(p: { _id: string; name: string; startDate: string; endDate: string }) {
    setEditingId(p._id);
    setEditName(p.name);
    setEditStart(p.startDate || toDateKey(new Date()));
    setEditEnd(p.endDate || toDateKey(new Date()));
    setEditError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || creating) return;

    setCreating(true);
    setCreateError(null);

    const result = await createProject(newName.trim(), newStart, newEnd);

    if (result.error) {
      setCreateError(result.error);
    } else {
      setOpen(false);
    }
    setCreating(false);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editName.trim() || saving) return;

    setSaving(true);
    setEditError(null);

    const result = await updateProject(editingId, {
      name: editName.trim(),
      startDate: editStart,
      endDate: editEnd,
    });

    if (result.error) {
      setEditError(result.error);
    } else {
      setEditingId(null);
    }
    setSaving(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className="flex items-center gap-1.5 rounded-full bg-app-accent px-3 py-1.5 text-sm font-medium text-ink"
      >
        <FolderIcon className="h-4 w-4 text-accent" />
        <span className="max-w-[9rem] truncate">
          {loading ? "載入中..." : currentProject?.name ?? GENERAL_LABEL}
        </span>
        <ChevronDownIcon className="h-3.5 w-3.5 text-ink-subtle" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-4 pb-8 md:rounded-3xl md:pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-card-border" />
            <h2 className="mb-3 text-base font-semibold text-ink">選擇專案</h2>

            <div className="mb-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  selectProject(null);
                  setOpen(false);
                }}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium ${
                  currentProjectId === null ? "bg-accent-soft text-accent" : "bg-app text-ink"
                }`}
              >
                {GENERAL_LABEL}
                {currentProjectId === null && <CheckIcon className="h-4 w-4" />}
              </button>

              {projects.map((p) => {
                const isCurrent = p._id === currentProjectId;
                const isEditing = editingId === p._id;

                if (isEditing) {
                  return (
                    <form
                      key={p._id}
                      onSubmit={handleSaveEdit}
                      className="flex flex-col gap-2 rounded-xl bg-app-accent p-3"
                    >
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="專案名稱"
                        className="rounded-xl border border-card-border bg-app px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={editStart}
                          onChange={(e) => handleEditStartChange(e.target.value)}
                          className="flex-1 rounded-xl border border-card-border bg-app px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                        />
                        <span className="shrink-0 text-sm text-ink-subtle">至</span>
                        <input
                          type="date"
                          value={editEnd}
                          onChange={(e) => handleEditEndChange(e.target.value)}
                          className="flex-1 rounded-xl border border-card-border bg-app px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                        />
                      </div>
                      {editError && <p className="text-sm text-danger">{editError}</p>}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex-1 rounded-xl border border-card-border py-2 text-sm font-medium text-ink-muted"
                        >
                          取消
                        </button>
                        <button
                          type="submit"
                          disabled={saving || !editName.trim()}
                          className="flex-1 rounded-xl bg-accent py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
                        >
                          {saving ? "儲存中..." : "儲存"}
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={p._id}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium ${
                      isCurrent ? "bg-accent-soft text-accent" : "bg-app text-ink"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        selectProject(p._id);
                        setOpen(false);
                      }}
                      className="flex flex-1 flex-col items-start text-left"
                    >
                      <span className="flex items-center gap-1.5">
                        {p.name}
                        {isCurrent && <CheckIcon className="h-3.5 w-3.5" />}
                      </span>
                      {p.startDate && p.endDate && (
                        <span className="text-xs font-normal text-ink-subtle">
                          {formatShortDate(p.startDate)} - {formatShortDate(p.endDate)}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="shrink-0 rounded-lg p-1.5 text-ink-subtle"
                      aria-label={`編輯${p.name}`}
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-ink-muted">新增專案</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例如：日常生活、旅遊基金"
                className="rounded-xl border border-card-border bg-app px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
              />
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={newStart}
                  onChange={(e) => handleNewStartChange(e.target.value)}
                  className="flex-1 rounded-xl border border-card-border bg-app px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
                />
                <span className="shrink-0 text-sm text-ink-subtle">至</span>
                <input
                  type="date"
                  value={newEnd}
                  onChange={(e) => handleNewEndChange(e.target.value)}
                  className="flex-1 rounded-xl border border-card-border bg-app px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
                />
              </div>
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-50"
              >
                {creating ? "建立中..." : "新增專案"}
              </button>
              {createError && <p className="text-sm text-danger">{createError}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
