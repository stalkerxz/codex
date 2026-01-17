export default function DashboardPage() {
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
            <p>Workspace: Default</p>
            <p>Status: Scheduled</p>
            <p>Platform: Telegram, VK</p>
          </div>
        </div>
        <div className="rounded bg-white p-4 shadow-sm md:col-span-2">
          <h2 className="text-sm font-semibold">Month view</h2>
          <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-slate-500">
            {Array.from({ length: 28 }).map((_, index) => (
              <div key={index} className="rounded border border-dashed border-slate-200 p-2">
                <div className="font-semibold text-slate-700">{index + 1}</div>
                {index % 6 === 0 && (
                  <div className="mt-2 rounded bg-emerald-50 px-2 py-1 text-emerald-700">Telegram • 09:00</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
