"use client";

import { useEffect, useState } from "react";
import { saveSession, loadSession } from "../lib/api";

export default function SessionBar() {
  const [token, setToken] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const session = loadSession();
    setToken(session.token);
    setWorkspaceId(session.workspaceId);
  }, []);

  const handleSave = () => {
    saveSession({ token, workspaceId });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="rounded border border-slate-200 bg-white px-4 py-3 text-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500">Access token</label>
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste JWT access token"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500">Workspace ID</label>
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={workspaceId}
            onChange={(event) => setWorkspaceId(event.target.value)}
            placeholder="Workspace UUID"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="rounded bg-slate-900 px-4 py-2 text-white"
        >
          Save
        </button>
      </div>
      {saved && <p className="mt-2 text-xs text-emerald-600">Saved locally.</p>}
    </div>
  );
}
