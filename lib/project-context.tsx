"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Project = { _id: string; name: string };

type ProjectContextValue = {
  projects: Project[];
  currentProjectId: string | null;
  currentProject: Project | null;
  loading: boolean;
  selectProject: (id: string | null) => void;
  createProject: (name: string) => Promise<{ error?: string }>;
};

const STORAGE_KEY = "currentProjectId";

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  // null = the general, unfiled ledger (the original date-based behavior).
  // It's a valid, always-available selection — not "no project chosen yet".
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    const res = await fetch("/api/projects", { cache: "no-store" });
    const data = await res.json().catch(() => null);
    const list: Project[] = data?.projects ?? [];
    setProjects(list);

    setCurrentProjectId((prev) => {
      if (prev && list.some((p) => p._id === prev)) return prev;
      if (prev === null) return null;

      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {
        stored = null;
      }

      return stored && list.some((p) => p._id === stored) ? stored : null;
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      await loadProjects();
    })();
  }, [loadProjects]);

  function selectProject(id: string | null) {
    setCurrentProjectId(id);
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEY, id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore write failures (private mode, quota, etc.)
    }
  }

  async function createProject(name: string): Promise<{ error?: string }> {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return { error: data?.error || "建立專案失敗" };
    }

    await loadProjects();
    selectProject(data.project._id);
    return {};
  }

  const currentProject = projects.find((p) => p._id === currentProjectId) ?? null;

  return (
    <ProjectContext.Provider
      value={{ projects, currentProjectId, currentProject, loading, selectProject, createProject }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return ctx;
}
