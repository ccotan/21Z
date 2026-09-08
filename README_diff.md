--- README.md (原始)


+++ README.md (修改后)
# Quadrant — Платформа для студентов

Многостраничное веб-приложение для студентов с системой авторизации, колесом фортуны, чатом, маркетплейсом и другими функциями.

## 🚀 Возможности

- **Авторизация** — вход по email/паролю или через Google
- **Колесо Фортуны** — случайный выбор дежурного студента
- **Регистрация студентов** — добавление студентов в систему
- **Маркетплейс** — продажа и покупка товаров
- **Чат** — общение в группе
- **Чат поддержки** — связь с администрацией
- **Вики** — информация о преподавателях
- **Домашние задания** — список заданий с дедлайнами
- **Жалобы** — подача и отслеживание обращений

## 📦 Структура проекта

```
quadrant/
├── index.html          # Точка входа
├── main.tsx            # Инициализация React
├── App.tsx             # Главный компонент и все страницы
├── index.css           # Все стили
├── package.json        # Зависимости
├── tsconfig.json       # Конфигурация TypeScript
├── vite.config.js      # Конфигурация Vite
└── .github/
    └── workflows/
        └── deploy.yml  # Автоматический деплой на GitHub Pages
```

## 🛠️ Локальный запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## 🌐 Деплой на GitHub Pages

### Автоматический деплой (рекомендуется)

1. Загрузите проект в репозиторий GitHub
2. Перейдите в **Settings** → **Pages**
3. В разделе **Source** выберите **GitHub Actions**
4. При каждом push в ветку `main` сайт будет автоматически деплоиться

### Ручной деплой

```bash
# Сборка проекта
npm run build

# Загрузите содержимое папки dist/ в ветку gh-pages
git subtree push --prefix dist origin gh-pages
```

## ⚙️ Конфигурация

### vite.config.js

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',  // Важно для GitHub Pages!
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});
```

**Ключевой параметр:** `base: './'` — делает все пути относительными, чтобы сайт работал на GitHub Pages.

## 📱 Адаптивность

- Desktop: полная версия с sidebar
- Tablet: адаптированная версия
- Mobile: компактная версия с гамбургер-меню и иконками 3x3

## 💾 Хранение данных

Все данные сохраняются в localStorage браузера:
- `quadrant_auth` — статус авторизации
- `quadrant_user` — данные пользователя
- `quadrant_students` — список студентов
- `quadrant_market` — объявления маркетплейса
- `quadrant_chat` — сообщения чата
- `quadrant_support` — сообщения поддержки
- `quadrant_hw` — домашние задания
- `quadrant_complaints` — жалобы

## 🎨 Технологии

- React 18
- TypeScript
- Vite
- Tailwind CSS
- GitHub Actions (для деплоя)

## 📝 Лицензия

MIT
