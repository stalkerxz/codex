"use client";

import { platformCapabilityMatrix } from "@postflow/shared";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { useSession } from "../../lib/session";

type SocialAccount = {
  id: string;
  platform: keyof typeof platformCapabilityMatrix;
  displayName: string;
  status: string;
};

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, workspaceId } = useSession();

  useEffect(() => {
    if (!token || !workspaceId) {
      return;
    }
    const fetchAccounts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch<SocialAccount[]>(`/social-accounts?workspaceId=${workspaceId}`, token);
        setAccounts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [token, workspaceId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Social Accounts</h1>
        <p className="text-sm text-slate-600">Manage connected channels and see capabilities.</p>
      </div>
      {loading && <p className="text-sm text-slate-500">Loading accounts…</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.length === 0 && (
            <div className="rounded border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              No accounts connected yet.
            </div>
          )}
          {accounts.map((account) => (
            <div key={account.id} className="rounded bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold capitalize">{account.platform}</p>
                  <p className="text-sm text-slate-600">{account.displayName}</p>
                </div>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{account.status}</span>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                {Object.entries(platformCapabilityMatrix[account.platform])
                  .filter(([, value]) => value)
                  .map(([key]) => key)
                  .join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
