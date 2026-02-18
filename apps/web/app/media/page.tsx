export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Media Library</h1>
        <p className="text-sm text-slate-600">Upload and reuse images or videos.</p>
      </div>
      <div className="rounded bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Assets</p>
          <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Upload media</button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex h-32 items-center justify-center rounded border border-dashed border-slate-200 text-xs text-slate-400">
              Media {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
