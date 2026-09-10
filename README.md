# Quadrant - Платформа для студентов

Многостраничное веб-приложение для студентов с системой авторизации, Firebase базой данных и множеством функций.

## 🚀 Возможности

- 🔐 Авторизация через Email/Password и Google
- 🎡 Колесо фортуны для выбора дежурного
- 👥 Регистрация студентов (1 аккаунт = 1 студент)
- 🛒 Маркетплейс с изображениями
- 💬 Чат в стиле Discord с файлами и упоминаниями
- 🎧 Чат поддержки с изображениями
- 📚 Вики (только админ может добавлять)
- 📝 Домашние задания
- 📅 Расписание (только админ может добавлять)
- ⚠️ Жалобы (Студент, Баги, Администрация)
- 🖼️ Обрезка аватарки как в Discord
- 👑 Админ панель для ccotanno@gmail.com

## 📦 Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте Firebase:
   - Создайте проект на https://console.firebase.google.com/
   - Включите Authentication (Email/Password + Google)
   - Создайте Firestore Database
   - Включите Storage
   - Скопируйте конфигурацию в `firebase.ts`

4. Запустите проект:
```bash
npm run dev
```

## 🔧 Настройка Firebase

### 1. Обновите firebase.ts

Замените конфигурацию на свою из Firebase Console:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. Обновите правила Firestore

Скопируйте содержимое `firestore.rules` в Firebase Console → Firestore Database → Rules

### 3. Обновите правила Storage

Добавьте правила для:
- `avatars/` - аватарки пользователей
- `chat-files/` - файлы чата
- `support-files/` - файлы чата поддержки
- `market-images/` - изображения маркетплейса

## 🌐 Деплой на GitHub Pages

### Вариант 1: Автоматический деплой

1. Загрузите все файлы в репозиторий
2. GitHub Actions автоматически соберет и задеплоит сайт
3. Включите GitHub Pages в Settings → Pages

### Вариант 2: Ручной деплой

1. Соберите проект:
```bash
npm run build
```

2. Загрузите содержимое папки `dist/` на GitHub:
   - `index.html`
   - `assets/` (со всем содержимым)

3. Настройте GitHub Pages:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `/ (root)`

## 📋 Структура проекта

```
quadrant/
├── App.tsx              # Главный компонент
├── index.css            # Стили
├── main.tsx             # Точка входа
├── firebase.ts          # Конфигурация Firebase
├── firestore.rules      # Правила безопасности
├── favicon.svg          # Иконка сайта
├── index.html           # HTML шаблон
├── package.json         # Зависимости
├── tsconfig.json        # Конфигурация TypeScript
├── vite.config.js       # Конфигурация Vite
└── README.md            # Эта инструкция
```

## 🎯 Использование

### Админ панель

Войдите через `ccotanno@gmail.com` для доступа к админ панели:
- Управление студентами
- Управление жалобами
- Статистика системы

### Обрезка аватарки

1. Нажмите на иконку камеры в левом нижнем углу
2. Выберите изображение
3. Перетаскивайте и масштабируйте
4. Нажмите "Сохранить"

### Чат

- Используйте `@username` для упоминания пользователей
- Загружайте файлы до 3.5 МБ
- Изображения отображаются как превью

## 🔐 Безопасность

- Все данные хранятся в Firebase Firestore
- Файлы загружаются в Firebase Storage
- Правила безопасности ограничивают доступ
- Только админ может управлять вики и расписанием

## 📱 Мобильная версия

- Адаптивный дизайн
- Гамбургер-меню
- Уменьшенные заголовки и кнопки
- Оптимизировано для мобильных устройств

## 🛠️ Технологии

- React 18
- TypeScript
- Vite
- Firebase (Auth, Firestore, Storage)
- Tailwind CSS

## 📄 Лицензия

MIT

## 👨‍💻 Автор

Создано для студентов группы 21Z
