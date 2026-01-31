import Link from "next/link";

const modules = [
  "Экспозиция и свет",
  "Композиция и история кадра",
  "Портрет: позирование и работа с моделью",
  "Репортаж и события",
  "Обработка: цвет/тон/стиль"
];

const outcomes = [
  "Уверенно управляете экспозицией и светом",
  "Снимаете портреты в студии и на улице",
  "Работаете с динамикой и репортажем",
  "Понимаете обработку в Lightroom/ACR",
  "Поддерживаете стабильный стиль"
];

const pricing = [
  { name: "Старт", price: "12 900 ₽", desc: "Доступ к базовым урокам и тренажёру на 3 месяца" },
  { name: "PRO", price: "24 900 ₽", desc: "Полный курс + проверка домашних работ" },
  { name: "Studio", price: "49 000 ₽", desc: "Индивидуальные сессии и портфолио-ревью" }
];

export default function HomePage() {
  return (
    <div className="space-y-20">
      <section className="container-base grid lg:grid-cols-2 gap-10 py-20">
        <div className="space-y-6">
          <p className="uppercase tracking-widest text-xs text-neutral-400">PROTOPOPOV PRODUCTION</p>
          <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">
            Курс по фотосъёмке, где практика важнее теории
          </h1>
          <p className="text-neutral-300 text-lg">
            Освойте профессиональную фотографию через практику с симулятором камеры, понятные уроки и
            обратную связь от авторов.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard" className="px-6 py-3 bg-white text-neutral-900 rounded-full font-medium">
              Начать обучение
            </Link>
            <Link href="/simulator" className="px-6 py-3 border border-white/20 rounded-full text-sm">
              Попробовать тренажёр
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-8 space-y-6">
          <h2 className="text-xl font-semibold">Что внутри курса</h2>
          <ul className="space-y-3 text-neutral-300">
            {modules.map((module) => (
              <li key={module} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-accent" />
                {module}
              </li>
            ))}
          </ul>
          <div className="rounded-2xl bg-white/5 p-4 text-sm text-neutral-300">
            25+ уроков, 12+ сценариев практикума, домашние задания и автооценка.
          </div>
        </div>
      </section>

      <section id="program" className="container-base grid gap-10">
        <h2 className="text-3xl font-semibold">Программа обучения</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((module) => (
            <div key={module} className="rounded-2xl border border-white/10 p-6 bg-white/5">
              <h3 className="font-medium text-lg">{module}</h3>
              <p className="text-neutral-400 text-sm mt-2">5 уроков + практика в симуляторе камеры.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-base grid lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold">Результаты</h2>
          <p className="text-neutral-400">Фокус на реальной практике: каждый модуль закрепляется упражнениями и симулятором.</p>
        </div>
        <ul className="space-y-3 text-neutral-300">
          {outcomes.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="h-2 w-2 mt-2 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section id="pricing" className="container-base grid gap-8">
        <h2 className="text-3xl font-semibold">Тарифы</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {pricing.map((plan) => (
            <div key={plan.name} className="rounded-2xl border border-white/10 p-6 bg-white/5 space-y-4">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-2xl font-semibold">{plan.price}</p>
              <p className="text-sm text-neutral-400">{plan.desc}</p>
              <button className="w-full px-4 py-2 rounded-full bg-white text-neutral-900">Выбрать</button>
            </div>
          ))}
        </div>
      </section>

      <section className="container-base grid gap-6">
        <h2 className="text-3xl font-semibold">FAQ</h2>
        <div className="grid md:grid-cols-2 gap-6 text-neutral-300">
          <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
            <h3 className="font-medium">Нужна ли камера?</h3>
            <p className="text-sm text-neutral-400 mt-2">Нет, можно начать в симуляторе и позже перейти на свою технику.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
            <h3 className="font-medium">Есть ли обратная связь?</h3>
            <p className="text-sm text-neutral-400 mt-2">Да, в тарифе PRO — ревью домашних заданий и персональные рекомендации.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
