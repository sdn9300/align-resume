"use client";

import { useCallback, useEffect, useState } from "react";

import { loadTailoringRun, saveTailoringRun } from "@/lib/run-storage";
import { tailoringRunSchema, type TailoringRun } from "@/lib/schemas";

type UseTailoringRunResult = {
  run: TailoringRun | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export function useTailoringRun(runId: string): UseTailoringRunResult {
  const [run, setRun] = useState<TailoringRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    const cached = loadTailoringRun(runId);
    if (cached) {
      setRun(cached);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/runs/${runId}`);
      if (!response.ok) {
        setRun(null);
        setError("This run was not found. Start a new analysis from the input page.");
        return;
      }

      const data: unknown = await response.json();
      const parsed = tailoringRunSchema.safeParse(data);
      if (!parsed.success) {
        setError("Stored run data is invalid. Please run analysis again.");
        return;
      }

      saveTailoringRun(parsed.data);
      setRun(parsed.data);
    } catch {
      setError("Could not load this run. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { run, loading, error, reload };
}
