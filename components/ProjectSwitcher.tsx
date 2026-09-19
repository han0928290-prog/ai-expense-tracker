"use client";

import { useState } from "react";
import { useProject } from "@/lib/project-context";
import { FolderIcon, ChevronDownIcon, CheckIcon } from "@/components/icons";

const GENERAL_LABEL = "日常記帳";

export function ProjectSwitcher() {
  const { projects, currentProjectId, currentProject, loading, selectProject, createProject } =
    useProject();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openSheet() {
    setOpen(true);
    setError(null);
    setNewName("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || creating) return;

    setCreating(true);
    setError(null);

    const result = await createProject(newName.trim());

    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
    setCreating(false);
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
            className="w-full max-w-md rounded-t-3xl bg-card p-4 pb-8 md:rounded-3xl md:pb-4"
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
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => {
                      selectProject(p._id);
                      setOpen(false);
                    }}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium ${
                      isCurrent ? "bg-accent-soft text-accent" : "bg-app text-ink"
                    }`}
                  >
                    {p.name}
                    {isCurrent && <CheckIcon className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-ink-muted">新增專案</label>
              <div className="flex gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例如：日常生活、旅遊基金"
                  className="flex-1 rounded-xl border border-card-border bg-app px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="shrink-0 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-50"
                >
                  {creating ? "建立中..." : "新增"}
                </button>
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
