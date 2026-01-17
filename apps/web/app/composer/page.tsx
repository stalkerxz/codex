import { platformCapabilityMatrix } from "@postflow/shared";

export default function ComposerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Composer</h1>
        <p className="text-sm text-slate-600">Draft once and adapt per platform.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Content</h2>
          <textarea className="w-full rounded border border-slate-200 p-3" rows={6} placeholder="Write your post..." />
          <div className="flex gap-2 text-sm">
            <button className="rounded border border-slate-200 px-3 py-1">Add media</button>
            <button className="rounded border border-slate-200 px-3 py-1">Add link</button>
            <button className="rounded border border-slate-200 px-3 py-1">Add poll</button>
          </div>
        </div>
        <div className="space-y-4 rounded bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Targets</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="rounded border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">Telegram @company</p>
              <p>Supports: {Object.entries(platformCapabilityMatrix.telegram).filter(([, v]) => v).map(([k]) => k).join(", ")}</p>
            </div>
            <div className="rounded border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">VK Community</p>
              <p>Supports: {Object.entries(platformCapabilityMatrix.vk).filter(([, v]) => v).map(([k]) => k).join(", ")}</p>
            </div>
            <div className="rounded border border-amber-200 bg-amber-50 p-3">
              <p className="font-semibold text-amber-900">Instagram (stub)</p>
              <p className="text-amber-800">Publishing is disabled until the adapter is implemented.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Schedule</h2>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <input className="rounded border border-slate-200 px-3 py-2" type="datetime-local" />
          <button className="rounded bg-slate-900 px-4 py-2 text-sm text-white">Schedule</button>
        </div>
      </div>
    </div>
  );
}
