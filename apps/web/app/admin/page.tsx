const stats = [
  { label: "Уроки", value: 25 },
  { label: "Сцены", value: 12 },
  { label: "Домашки", value: 84 }
];

export default function AdminPage() {
  return (
    <div className="container-base py-16 space-y-8">
      <h1 className="text-3xl font-semibold">Админка</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 p-6 bg-white/5">
            <p className="text-sm text-neutral-400">{stat.label}</p>
            <p className="text-3xl font-semibold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-white/10 p-6 bg-white/5">
        <h2 className="text-lg font-semibold">Управление контентом</h2>
        <p className="text-sm text-neutral-400 mt-2">Используйте API /admin для CRUD модулей, уроков и сцен.</p>
      </div>
    </div>
  );
}
