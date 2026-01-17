export default function PostDetailsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Post details</h1>
        <p className="text-sm text-slate-600">Preview, status, and publish attempts.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Preview</h2>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="rounded border border-slate-200 p-3">Telegram preview</div>
            <div className="rounded border border-slate-200 p-3">VK preview</div>
          </div>
        </div>
        <div className="rounded bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Status</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Scheduled at: 2024-09-01 09:00</p>
            <p>Status: Scheduled</p>
            <button className="rounded border border-slate-200 px-3 py-2 text-sm">Retry publish</button>
          </div>
        </div>
      </div>
      <div className="rounded bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Attempts</h2>
        <div className="mt-3 space-y-2 text-sm text-slate-600">
          <div className="rounded border border-slate-200 p-2">Attempt #1 • Success</div>
          <div className="rounded border border-slate-200 p-2">Attempt #2 • Failed (rate limit)</div>
        </div>
      </div>
    </div>
  );
}
