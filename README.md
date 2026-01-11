# Sheregesh Ride MVP

MVP браузерной игры про катание на сноуборде и лыжах на курорте Шерегеш (гора Зелёная). Проект использует Vite + React + TypeScript, рендер через `@react-three/fiber`/`three`, физическую модель движения на склоне и базовую интеграцию Rapier для столкновений.

## Быстрый старт

```bash
npm install
npm run prepare-world
npm run dev
```

Откройте `http://localhost:5173`.

## Где лежат данные мира

Генерация складывает все артефакты в `public/data_generated/`:

- `heightmap.png` — высоты рельефа (grayscale)
- `metadata.json` — bbox, диапазон высот, источник DEM
- `pistes.geojson` — трассы
- `lifts.geojson` — подъёмники

**Важно:** бинарные файлы не коммитятся в git, они генерируются локально командой `npm run prepare-world`.

## Конфиг мира

Параметры генерации лежат в `tools/world-config.json`:

- `bbox` — границы района (lat/lon)
- `resolution` — разрешение heightmap
- `demSource` — источник DEM (например, `srtm30m`)

Измените bbox и повторно запустите `npm run prepare-world`.

## Управление

- **W/S** — перенос веса вперёд/назад
- **A/D** — закантовка/поворот
- **Shift** — торможение
- **Space** — прыжок
- **M** — переключение режима (сноуборд / лыжи)

## Производительность

- LOD для рельефа (chunk-based)
- Инстансинг деревьев
- Туман для ограничения дальности прорисовки
- Настройки качества (Low/Medium/High)

## Источники данных и лицензии

- Высоты: **SRTM 30m** (OpenTopodata). См. https://www.opentopodata.org/
- Векторные данные: **OpenStreetMap** (ODbL). См. https://www.openstreetmap.org/copyright

Все ассеты в проекте — примитивы/CC0.

## Ограничения точности

SRTM 30m даёт усреднённый рельеф. Для более точного рельефа увеличьте `resolution` или замените источник DEM в `prepare-world` на Copernicus GLO-30. Можно добавить лёгкий procedural noise, но аккуратно, чтобы не исказить реальные формы.
