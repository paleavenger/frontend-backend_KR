
## Структура репозитория

```
frontend-backend-kr/
├── PR1/        - HTML/SCSS, статичная карточка товара
├── PR2/        - Express.js, базовый REST API
├── PR3/        - Express.js + внешнее API (курсы валют)
├── PR4/        - React SPA + Express backend, магазин (без авторизации)
├── PR5/        - Express + Swagger + CORS, расширенный CRUD товаров
├── PR7/        - Express + bcrypt, базовая аутентификация
├── PR8/        - Express + JWT (access-токен) + Swagger
├── PR9/        - Express + JWT (access + refresh токены) + Swagger
├── PR10/       - Full-stack: React + Express + JWT + refresh-токены
└── PR11/       - Full-stack: React + Express + JWT + RBAC (роли)
```

---

## Практическая работа 1 - Статичная карточка товара

**Папка:** `PR1/`

Верстка карточки товара с использованием HTML и SCSS. Адаптивный дизайн, компиляция SCSS в CSS.

**Запуск:** открыть `PR1/card.html` в браузере.

---

## Практическая работа 2 - Базовый REST API

**Папка:** `PR2/`

Простой Express-сервер с in-memory хранилищем товаров. Реализованы базовые CRUD-операции без аутентификации.

**Запуск:**
```bash
cd PR2
node app.js
```

Сервер: `http://localhost:3000`

**Эндпоинты:**

| Метод | Путь | Описание |
|---|---|---|
| GET | `/` | Список всех товаров |
| POST | `/goods` | Добавить товар |
| PATCH | `/goods/:id` | Обновить товар |
| DELETE | `/goods/:id` | Удалить товар |

---

## Практическая работа 3 - REST API + внешнее API

**Папка:** `PR3/`

Express-сервер с собственным CRUD API и интеграцией внешнего API курсов валют.
Скриншоты результатов запросов находятся в `PR3/screens/`.

**Запуск:**
```bash
cd PR3
node app.js
```

Подробнее: [`PR3/README.md`](PR3/README.md)

---

## Практическая работа 4 - React SPA + Express backend

**Папка:** `PR4/`

Полноценное SPA на React с бэкендом на Express. Магазин видеоигр: список товаров, добавление, редактирование, удаление. Авторизации нет.

**Запуск бэкенда:**
```bash
cd PR4/backend
node server.js
```

**Запуск фронтенда:**
```bash
cd PR4
npm install
npm run dev
```

- Frontend: `http://127.0.0.1:5173`
- Backend API: `http://localhost:3000/api`

---

## Практическая работа 5 - Express + Swagger + CORS

**Папка:** `PR5/`

Расширенный CRUD товаров с документацией Swagger UI и поддержкой CORS для подключения фронтенда.

**Запуск:**
```bash
cd PR5
npm install
node server.js
```

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api-docs`

---

## Практическая работа 7 - Аутентификация с bcrypt

**Папка:** `PR7/`

Express-сервер с регистрацией/входом пользователей. Пароли хешируются через bcrypt. Защита маршрутов через сессии. Документация Swagger.

**Запуск:**
```bash
cd PR7
npm install
node index.js
```

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api-docs`

**Эндпоинты аутентификации:**

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| GET | `/api/auth/me` | Профиль (защищён) |

---

## Практическая работа 8 - JWT Access-токен + Swagger

**Папка:** `PR8/`

JWT-аутентификация с access-токеном (15 мин). При входе возвращается `accessToken`, который нужно передавать в заголовке `Authorization: Bearer <token>` для доступа к защищённым маршрутам.

**Запуск:**
```bash
cd PR8
npm install
node index.js
```

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api-docs`

**Эндпоинты:**

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| POST | `/api/auth/register` | Публичный | Регистрация |
| POST | `/api/auth/login` | Публичный | Вход → `accessToken` |
| GET | `/api/auth/me` | JWT | Профиль |
| GET | `/api/products` | JWT | Список товаров |
| POST | `/api/products` | JWT | Создать товар |
| GET | `/api/products/:id` | JWT | Товар по ID |
| PUT | `/api/products/:id` | JWT | Обновить товар |
| DELETE | `/api/products/:id` | JWT | Удалить товар |

---

## Практическая работа 9 - JWT Access + Refresh токены

**Папка:** `PR9/`

Расширение PR8: добавлена система refresh-токенов (7 дней). При входе возвращается пара `accessToken` + `refreshToken`. Refresh-эндпоинт выдаёт новую пару с ротацией (старый refresh-токен аннулируется).

**Запуск:**
```bash
cd PR9
npm install
node index.js
```

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api-docs`

**Ключевые эндпоинты:**

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/auth/login` | Вход → `accessToken` + `refreshToken` |
| POST | `/api/auth/refresh` | Обновление пары токенов (Bearer refresh-токен в заголовке) |

**Как работает ротация токенов:**
1. Клиент хранит оба токена
2. При истечении access-токена отправляет refresh-токен на `/api/auth/refresh`
3. Сервер удаляет старый refresh-токен из хранилища и выдаёт новую пару
4. Скомпрометированный refresh-токен становится недействителен после первого использования

---

## Практическая работа 10 - React + JWT

**Папка:** `PR10/`

React-фронтенд + Express-бэкенд с JWT-аутентификацией и refresh-токенами. Автоматическое обновление токенов через Axios-интерсепторы.

**Структура:**
```
PR10/
├── backend/
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/index.js      - Axios клиент с интерсепторами
│       └── pages/
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           └── ShopPage.jsx
└── vite.config.js
```

**Запуск бэкенда:**
```bash
cd PR10/backend
npm install
node server.js
```

**Запуск фронтенда:**
```bash
cd PR10
npm install
npm run dev
```

## Практическая работа 11 - Fullstack + RBAC

**Папка:** `PR11/`

Расширение PR10 с системой ролевого доступа (Role-Based Access Control).

**Роли:**

| Роль | Права |
|---|---|
| `user` | Просмотр товаров |
| `seller` | Просмотр + создание + редактирование товаров |
| `admin` | Полный доступ к товарам + управление пользователями |

**Структура:**
```
PR11/
├── backend/
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/index.js
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── ShopPage.jsx
│       │   └── UsersPage.jsx
│       └── styles/main.css
└── vite.config.js
```

**Запуск бэкенда:**
```bash
cd PR11/backend
npm install
node server.js
```

**Запуск фронтенда:**
```bash
cd PR11
npm install
npm run dev
```

**API эндпоинты:**

| Метод | Путь | Роли | Описание |
|---|---|---|---|
| POST | `/api/auth/register` | Публичный | Регистрация (выбор роли) |
| POST | `/api/auth/login` | Публичный | Вход → пара токенов |
| POST | `/api/auth/refresh` | Публичный | Обновление токенов |
| GET | `/api/auth/me` | Все авторизованные | Профиль |
| GET | `/api/users` | admin | Список пользователей |
| GET | `/api/users/:id` | admin | Пользователь по ID |
| PUT | `/api/users/:id` | admin | Изменить имя/роль |
| DELETE | `/api/users/:id` | admin | Заблокировать пользователя |
| GET | `/api/products` | user, seller, admin | Список товаров |
| POST | `/api/products` | seller, admin | Создать товар |
| GET | `/api/products/:id` | user, seller, admin | Товар по ID |
| PUT | `/api/products/:id` | seller, admin | Обновить товар |
| DELETE | `/api/products/:id` | admin | Удалить товар |
