import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/lib/passwords.js";

const prisma = new PrismaClient();

const modules = [
  { title: "Экспозиция и свет", lessons: [
    "Экспозиция как язык света",
    "ISO, выдержка, диафрагма",
    "Экспозамер и гистограмма",
    "Световые схемы и контраст",
    "Работа с естественным светом"
  ] },
  { title: "Композиция и история кадра", lessons: [
    "Композиционные оси",
    "Цвет и ритм",
    "История через детали",
    "Геометрия и архитектура",
    "Практика: серия снимков"
  ] },
  { title: "Портрет: позирование и работа с моделью", lessons: [
    "Психология портрета",
    "Позирование и пластика",
    "Работа с волосами и кожей",
    "Студийные насадки",
    "Съёмка на улице"
  ] },
  { title: "Репортаж и события", lessons: [
    "Подготовка к событию",
    "Серии и тайминг",
    "Свет в помещениях",
    "Съёмка в движении",
    "Быстрая передача материала"
  ] },
  { title: "Обработка: цвет/тон/стиль", lessons: [
    "Базовый workflow",
    "Цветовой баланс",
    "Тон и контраст",
    "Стилизация под фильм",
    "Экспорт и публикация"
  ] }
];

const scenes = [
  { title: "Портрет в рассеянном свете", category: "Портрет", description: "Улица, мягкое облачное освещение", baseImage: "/scenes/portrait_soft.jpg", lightKelvin: 6200, lightTint: 5, movement: 1, distanceM: 2, focalMM: 85, difficulty: 2 },
  { title: "Студийный портрет", category: "Портрет", description: "Студия, софтбокс и контровик", baseImage: "/scenes/portrait_studio.jpg", lightKelvin: 5600, lightTint: 0, movement: 0, distanceM: 3, focalMM: 85, difficulty: 3 },
  { title: "Репортаж на концерте", category: "Репортаж", description: "Темный зал и цветной свет", baseImage: "/scenes/concert.jpg", lightKelvin: 4200, lightTint: -10, movement: 4, distanceM: 8, focalMM: 70, difficulty: 4 },
  { title: "Спорт в помещении", category: "Спорт", description: "Быстрые спортсмены и слабый свет", baseImage: "/scenes/sport_indoor.jpg", lightKelvin: 4800, lightTint: -5, movement: 6, distanceM: 15, focalMM: 135, difficulty: 5 },
  { title: "Авто ночью на АЗС", category: "Ночь", description: "Смешанный свет, неон", baseImage: "/scenes/car_night.jpg", lightKelvin: 3500, lightTint: -15, movement: 2, distanceM: 10, focalMM: 50, difficulty: 4 },
  { title: "Архитектура на закате", category: "Архитектура", description: "Высокий контраст и теплый свет", baseImage: "/scenes/architecture_sunset.jpg", lightKelvin: 6800, lightTint: 10, movement: 0, distanceM: 30, focalMM: 24, difficulty: 3 },
  { title: "Уличный репортаж днем", category: "Репортаж", description: "Солнечный день и тени", baseImage: "/scenes/street_day.jpg", lightKelvin: 5500, lightTint: 0, movement: 2, distanceM: 5, focalMM: 35, difficulty: 2 },
  { title: "Ночной город", category: "Ночь", description: "Длинная выдержка и световые хвосты", baseImage: "/scenes/night_city.jpg", lightKelvin: 3200, lightTint: -20, movement: 1, distanceM: 20, focalMM: 35, difficulty: 4 },
  { title: "Пейзаж в тумане", category: "Пейзаж", description: "Низкий контраст, рассеянный свет", baseImage: "/scenes/fog_landscape.jpg", lightKelvin: 6500, lightTint: 5, movement: 0, distanceM: 40, focalMM: 28, difficulty: 2 },
  { title: "Свадьба в помещении", category: "Свадьба", description: "Смешанное освещение и динамика", baseImage: "/scenes/wedding_indoor.jpg", lightKelvin: 4000, lightTint: -8, movement: 3, distanceM: 6, focalMM: 50, difficulty: 4 },
  { title: "Детский портрет", category: "Портрет", description: "Движение и эмоции", baseImage: "/scenes/kids.jpg", lightKelvin: 5200, lightTint: 3, movement: 5, distanceM: 2, focalMM: 50, difficulty: 3 },
  { title: "Рассвет у воды", category: "Пейзаж", description: "Холодный свет и тишина", baseImage: "/scenes/sunrise_water.jpg", lightKelvin: 7000, lightTint: 12, movement: 0, distanceM: 50, focalMM: 24, difficulty: 3 }
];

const tasks = [
  { title: "Правильная экспозиция", goal: "Добейтесь нейтральной экспозиции без пересветов", targetEV: 9, maxBlur: 0.4, maxNoise: 0.5, minDOF: 0.6 },
  { title: "Заморозить движение", goal: "Остановите движение объекта", targetEV: 8.5, maxBlur: 0.2, maxNoise: 0.7, minDOF: 0.5 },
  { title: "Размыть фон", goal: "Сделайте малую ГРИП", targetEV: 8, maxBlur: 0.5, maxNoise: 0.6, minDOF: 0.3 },
  { title: "Съёмка при слабом свете", goal: "Сохраните детализацию и шум под контролем", targetEV: 6.5, maxBlur: 0.4, maxNoise: 0.6, minDOF: 0.4 }
];

async function main() {
  const adminEmail = "admin@protopopov.dev";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "PROTOPOPOV Admin",
        role: Role.admin,
        passwordHash: await hashPassword("Admin123!")
      }
    });
  }

  const course = await prisma.course.upsert({
    where: { slug: "photography-pro" },
    update: {},
    create: {
      title: "Курс по фотосъёмке от PROTOPOPOV PRODUCTION",
      slug: "photography-pro",
      description: "Практический курс с тренажёром камеры и полноценными заданиями.",
      heroImage: "/hero/landing.jpg"
    }
  });

  for (const [index, module] of modules.entries()) {
    const mod = await prisma.module.create({
      data: {
        title: module.title,
        order: index + 1,
        courseId: course.id
      }
    });

    for (const [lessonIndex, lessonTitle] of module.lessons.entries()) {
      const lesson = await prisma.lesson.create({
        data: {
          title: lessonTitle,
          slug: `${mod.title.toLowerCase().replace(/\s+/g, "-")}-${lessonIndex + 1}`,
          summary: "Ключевые инструменты, практики и подсказки для работы с камерой.",
          order: lessonIndex + 1,
          moduleId: mod.id
        }
      });

      await prisma.lessonContentBlock.createMany({
        data: [
          {
            lessonId: lesson.id,
            order: 1,
            type: "text",
            data: { content: "Объяснение темы урока и примеры." }
          },
          {
            lessonId: lesson.id,
            order: 2,
            type: "video",
            data: { url: "https://cdn.example.com/video.mp4", duration: 420 }
          },
          {
            lessonId: lesson.id,
            order: 3,
            type: "simulator",
            data: { sceneHint: "Запустите практикум и выполните задачу" }
          }
        ]
      });

      await prisma.homework.create({
        data: {
          title: "Домашнее задание",
          prompt: "Сделайте серию из 5 кадров по теме урока.",
          lessonId: lesson.id
        }
      });
    }
  }

  for (const scene of scenes) {
    const created = await prisma.simulatorScene.create({
      data: scene
    });
    for (const task of tasks) {
      await prisma.simulatorTask.create({
        data: {
          ...task,
          sceneId: created.id
        }
      });
    }
  }

  await prisma.product.create({
    data: {
      name: "Полный доступ на 6 месяцев",
      priceCents: 24900,
      currency: "RUB",
      interval: "one_time",
      courseId: course.id
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
