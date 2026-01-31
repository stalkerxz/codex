import Link from "next/link";

const progress = [
  { module: "Экспозиция и свет", lesson: "Экспозиция как язык света", percent: 80 },
  { module: "Композиция", lesson: "Цвет и ритм", percent: 45 },
  { module: "Портрет", lesson: "Позирование и пластика", percent: 20 }
];

const achievements = ["Выставили экспозицию без пересветов", "Сделали серию портретов", "Прошли 10 уроков подряд"];

export default function DashboardPage() {
  return (
    <div className="container-base py-16 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold">Личный кабинет</h1>
          <p className="text-neutral-400">Ваш прогресс и рекомендации на сегодня.</p>
        </div>
        <Link href="/simulator" className="px-6 py-3 rounded-full bg-white text-neutral-900">
          Открыть практикум
        </Link>
      </div>

      <section className="grid md:grid-cols-3 gap-6">
        {progress.map((item) => (
          <div key={item.lesson} className="rounded-2xl border border-white/10 p-6 bg-white/5">
            <p className="text-sm text-neutral-400">{item.module}</p>
            <h3 className="text-lg font-medium mt-2">{item.lesson}</h3>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-accent" style={{ width: `${item.percent}%` }} />
            </div>
            <p className="text-xs text-neutral-400 mt-2">{item.percent}% завершено</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 p-8 bg-white/5 space-y-4">
        <h2 className="text-xl font-semibold">Достижения</h2>
        <ul className="grid md:grid-cols-3 gap-4 text-sm text-neutral-300">
          {achievements.map((item) => (
            <li key={item} className="rounded-2xl border border-white/10 p-4">{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
