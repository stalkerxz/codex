"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { useSession } from "../../lib/session";

type CalendarItem = {
  id: string;
  scheduledAt: string | null;
  status: string;
  post: { title: string };
  socialAccount: { platform: string; displayName: string };
};

export default function DashboardPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { token, workspaceId } = useSession();

  useEffect(() => {
    if (!token || !workspaceId) {
      return;
    }
    const fetchCalendar = async () => {
      setLoading(true);
      setError("");
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + 30);
      try {
        const data = await apiFetch<CalendarItem[]>(
          `/calendar?workspaceId=${workspaceId}&from=${from.toISOString()}&to=${to.toISOString()}`,
          token
        );
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load calendar");
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, [token, workspaceId]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-sm text-slate-600">Unified view of scheduled posts.</p>
        </div>
        <a className="rounded bg-slate-900 px-4 py-2 text-sm text-white" href="/composer">
          Create post
        </a>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Filters</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Workspace: {workspaceId || "Not set"}</p>
            <p>Status: {items.length ? "Mixed" : "No data"}</p>
            <p>Platform: {items.length ? "Multiple" : "Unknown"}</p>
          </div>
        </div>
        <div className="rounded bg-white p-4 shadow-sm md:col-span-2">
          <h2 className="text-sm font-semibold">Month view</h2>
          {loading && <p className="mt-4 text-sm text-slate-500">Loading calendar…</p>}
          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
          {!loading && !error && (
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {items.length === 0 && <p>No scheduled posts in the next 30 days.</p>}
              {items.map((item) => (
                <div key={item.id} className="rounded border border-slate-200 p-3">
                  <div className="font-semibold text-slate-900">{item.post.title}</div>
                  <div className="text-xs text-slate-500">
                    {item.socialAccount.platform} · {item.socialAccount.displayName}
                  </div>
                  <div className="text-xs text-slate-500">
                    Scheduled: {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : "Not set"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Status: {item.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
