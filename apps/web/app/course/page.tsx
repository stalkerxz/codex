const modules = [
  {
    title: "Экспозиция и свет",
    lessons: ["Экспозиция как язык света", "ISO, выдержка, диафрагма", "Экспозамер и гистограмма", "Световые схемы", "Естественный свет"]
  },
  {
    title: "Композиция и история кадра",
    lessons: ["Композиционные оси", "Цвет и ритм", "История через детали", "Геометрия", "Практика"]
  }
];

export default function CoursePage() {
  return (
    <div className="container-base py-16 space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">Курс</h1>
        <p className="text-neutral-400">Модули и уроки с практикумом.</p>
      </div>
      <div className="space-y-6">
        {modules.map((module) => (
          <div key={module.title} className="rounded-2xl border border-white/10 p-6 bg-white/5">
            <h2 className="text-xl font-semibold">{module.title}</h2>
            <ul className="mt-4 grid md:grid-cols-2 gap-3 text-neutral-300 text-sm">
              {module.lessons.map((lesson) => (
                <li key={lesson} className="rounded-xl border border-white/10 p-3">{lesson}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
