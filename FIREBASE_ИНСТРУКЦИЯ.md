# 🔥 ПОЛНАЯ ИНСТРУКЦИЯ: Настройка Firebase с нуля

## 📋 ЧТО ВЫ ПОЛУЧИТЕ:

✅ Настоящая база данных (Firestore)  
✅ Аутентификация через email/пароль  
✅ Вход через Google  
✅ Синхронизация данных между устройствами  
✅ Бесплатно до 1GB данных и 50K чтений/день  

---

## 🚀 ШАГ 1: Создание проекта Firebase

### 1.1 Зайдите в Firebase Console
- Откройте: https://console.firebase.google.com/
- Войдите через Google аккаунт

### 1.2 Создайте новый проект
1. Нажмите **"Add project"** (или "Добавить проект")
2. **Project name**: `quadrant` (или любое название)
3. Можно отключить Google Analytics (не обязательно для нашего проекта)
4. Нажмите **Continue** → **Create project**
5. Подождите 30 секунд пока проект создастся
6. Нажмите **Continue**

---

## 🔥 ШАГ 2: Настройка Firestore Database

### 2.1 Создайте базу данных
1. В левом меню найдите **Build** → **Firestore Database**
2. Нажмите **Create database** (Создать базу данных)

### 2.2 Настройте базу
1. **Database location**: Выберите `eur3 (europe-west)` 
   - Или ближайший к вам регион
2. **Security rules**: Выберите **Start in test mode**
   - ⚠️ Это для разработки! Позже изменим на production rules
3. Нажмите **Enable**
4. Подождите 1-2 минуты пока база создастся

### 2.3 Проверьте что база работает
- Должна появиться пустая база данных
- Вкладка **Data** должна быть активна

---

## 🔐 ШАГ 3: Настройка Authentication

### 3.1 Включите аутентификацию
1. В левом меню: **Build** → **Authentication**
2. Нажмите **Get started** (Начать)

### 3.2 Включите провайдеры входа
На вкладке **Sign-in method** включите:

#### Email/Password
1. Найдите **Email/Password** в списке
2. Нажмите на него
3. Включите переключатель **Enable**
4. Нажмите **Save**

#### Google
1. Найдите **Google** в списке
2. Нажмите на него
3. Включите переключатель **Enable**
4. **Project support email**: Выберите ваш email
5. Нажмите **Save**

### 3.3 Проверьте
- Должны быть включены: Email/Password и Google
- Вкладка **Users** покажет список пользователей (пока пустой)

---

## ⚙️ ШАГ 4: Получение конфигурации Firebase

### 4.1 Откройте настройки проекта
1. Нажмите на иконку ⚙️ (шестерёнка) рядом с **Project Overview**
2. Выберите **Project settings** (Настройки проекта)

### 4.2 Добавьте веб-приложение
1. Прокрутите вниз до секции **Your apps** (Ваши приложения)
2. Нажмите на иконку **Web** (</>)
3. **App nickname**: `quadrant-web`
4. **НЕ ставьте** галочку "Also set up Firebase Hosting"
5. Нажмите **Register app** (Зарегистрировать приложение)

### 4.3 Скопируйте конфигурацию
Появится окно с кодом. Найдите секцию:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "quadrant-xxxxx.firebaseapp.com",
  projectId: "quadrant-xxxxx",
  storageBucket: "quadrant-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

**🔴 ВАЖНО: Скопируйте ВСЮ конфигурацию!**  
Она понадобится для следующего шага.

---

## 💻 ШАГ 5: Интеграция Firebase в код

### 5.1 Откройте файл `firebase.ts`
Найдите файл `firebase.ts` в корне проекта.

### 5.2 Замените конфигурацию
Найдите секцию:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  // ... остальные поля
};
```

**Замените её на вашу конфигурацию из Firebase Console!**

Пример:
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxx",
  authDomain: "quadrant-abc123.firebaseapp.com",
  projectId: "quadrant-abc123",
  storageBucket: "quadrant-abc123.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 5.3 Сохраните файл

---

## 🏗️ ШАГ 6: Сборка и деплой

### 6.1 Установите зависимости (если ещё не установлено)
```bash
npm install
```

### 6.2 Соберите проект
```bash
npm run build
```

### 6.3 Загрузите на GitHub
Загрузите содержимое папки `dist/` на GitHub (как описано в основной инструкции).

---

## ✅ ШАГ 7: Проверка работы

### 7.1 Откройте сайт
Зайдите на ваш сайт на GitHub Pages.

### 7.2 Проверьте регистрацию
1. Должна появиться страница входа
2. Попробуйте зарегистрироваться через email
3. Или войдите через Google

### 7.3 Проверьте базу данных
1. Вернитесь в Firebase Console
2. Откройте **Firestore Database**
3. Должны появиться коллекции с данными:
   - `users` - пользователи
   - `students` - студенты
   - `homeworks` - задания
   - и т.д.

---

## 🔒 ШАГ 8: Настройка безопасности (ОПЦИОНАЛЬНО)

### 8.1 Измените правила Firestore
⚠️ **Сделайте это ПОСЛЕ тестирования!**

1. В Firebase Console: **Firestore Database** → вкладка **Rules**
2. Замените правила на:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать/писать только свои данные
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Все аутентифицированные пользователи могут читать общие данные
    match /students/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /homeworks/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Остальные коллекции
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Нажмите **Publish** (Опубликовать)

---

## 🐛 РЕШЕНИЕ ПРОБЛЕМ

### Проблема: "Firebase: Error (auth/configuration-not-found)"
**Решение:** 
- Проверьте что включили Email/Password в Authentication → Sign-in method
- Подождите 1-2 минуты после включения

### Проблема: "Firebase: Error (auth/api-key-not-valid)"
**Решение:**
- Проверьте что скопировали правильную конфигурацию в `firebase.ts`
- Убедитесь что нет опечаток в apiKey

### Проблема: "Missing or insufficient permissions"
**Решение:**
- Проверьте правила Firestore (Firestore Database → Rules)
- Для тестирования используйте test mode

### Проблема: Пользователь не сохраняется
**Решение:**
- Откройте консоль браузера (F12)
- Проверьте ошибки
- Убедитесь что Firestore Database создан

---

## 📊 СТРУКТУРА ДАННЫХ В FIREBASE

Firebase автоматически создаст следующие коллекции:

### `users`
```javascript
{
  uid: "user_id",
  email: "user@example.com",
  name: "Имя пользователя",
  createdAt: timestamp
}
```

### `students`
```javascript
{
  id: "student_id",
  name: "Иванов Иван",
  group: "ИС-21",
  color: "gradient",
  createdBy: "user_id"
}
```

### `homeworks`
```javascript
{
  id: "hw_id",
  subject: "Математика",
  title: "Интегралы",
  description: "Решить задачи",
  deadline: "2026-02-15",
  teacher: "Иванов А.П.",
  createdBy: "user_id"
}
```

И другие коллекции для чатов, жалоб, маркетплейса и т.д.

---

## 🔄 СИНХРОНИЗАЦИЯ

Все данные автоматически синхронизируются:
- ✅ Между устройствами
- ✅ В реальном времени
- ✅ Без необходимости перезагрузки

---

## 💰 ЛИМИТЫ БЕСПЛАТНОГО ПЛАНА

Firebase Spark (бесплатный):
- **Firestore**: 1 GB хранилище, 50K чтений/день, 20K записей/день
- **Authentication**: Безлимитно
- **Hosting**: 10 GB хранилище, 360 MB/день

Для студенческого проекта этого более чем достаточно!

---

## 📞 ПОДДЕРЖКА

Если что-то не работает:
1. Проверьте консоль браузера (F12)
2. Проверьте Firebase Console → Logs
3. Убедитесь что конфигурация правильная
4. Проверьте правила Firestore

---

## ✅ ЧЕКЛИСТ

- [ ] Создан проект в Firebase Console
- [ ] Создана Firestore Database
- [ ] Включена Authentication (Email/Password + Google)
- [ ] Скопирована конфигурация в `firebase.ts`
- [ ] Установлен Firebase: `npm install firebase`
- [ ] Проект собран: `npm run build`
- [ ] Загружен на GitHub Pages
- [ ] Регистрация работает
- [ ] Данные сохраняются в Firestore

---

**Готово!** 🎉 Теперь у вас полноценное приложение с базой данных!
