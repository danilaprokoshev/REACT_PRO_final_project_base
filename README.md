# 🐕 DogFood Store — React-приложение для интернет-магазина

> Учебный проект интернет-магазина кормов для животных, реализованный на React 19 с акцентом на бизнес-логику, архитектуру Feature-Sliced Design и оптимизацию производительности.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-purple?logo=redux)
![MUI](https://img.shields.io/badge/Material_UI-5-007FFF?logo=mui)

---

## 📋 Содержание

- [📝 Описание](#-описание)
- [🛠 Стек технологий](#-стек-технологий)
- [⚙️ Ключевой функционал](#️-ключевой-функционал)
- [🚀 Оптимизация и производительность](#-оптимизация-и-производительность)
- [📂 Структура проекта](#-структура-проекта)
- [🔧 Сравнение сборок](#-сравнение-сборок)
- [💻 Инструкция по запуску](#-инструкция-по-запуску)
- [🌐 API](#-api)
- [📁 Важные файлы](#-важные-файлы)

---

## 📝 Описание

**DogFood Store** — веб-приложение для просмотра, поиска и покупки товаров (кормов для собак). Реализован полный пользовательский цикл: регистрация и авторизация, просмотр каталога с сортировкой и поиском, детальная карточка товара с отзывами, корзина покупок и страница избранного.

«Рыба» (визуальные компоненты, макеты) готова. Основной фокус проекта — **бизнес-логика**: управление состоянием через Redux Toolkit, работа с REST API через RTK Query, формы с валидацией, HOC-защита маршрутов и комплексные меры по оптимизации рендеров.

---

## 🛠 Стек технологий

| Категория            | Инструмент                                    |
| -------------------- | --------------------------------------------- |
| **Язык**             | TypeScript 5 (strict mode)                    |
| **UI-библиотека**    | React 19                                      |
| **State management** | Redux Toolkit + RTK Query                     |
| **Маршрутизация**    | React Router v6 (`createBrowserRouter`)       |
| **UI-компоненты**    | Material UI (MUI) v5                          |
| **Стилизация**       | CSS Modules + PostCSS (autoprefixer, cssnano) |
| **Формы**            | react-hook-form + yup                         |
| **Сборка**           | Webpack 5 / esbuild (альтернативная)          |
| **Линтинг**          | ESLint + Stylelint + Prettier                 |
| **Git-хуки**         | Husky + lint-staged + Commitizen              |
| **Уведомления**      | react-toastify                                |

---

## ⚙️ Ключевой функционал

### 🗄️ Управление состоянием (Redux Toolkit)

Приложение использует три основных **slice**:

| Slice      | Назначение                                                        | Основные actions                                             |
| ---------- | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| `products` | Состояние каталога (сортировка, поиск, пагинация)                 | `setSort`, `setSearchText`, `setPage`                        |
| `cart`     | Корзина пользователя (добавление, удаление, изменение количества) | `addCartProduct`, `deleteCartProduct`, `setCartProductCount` |
| `user`     | Данные пользователя и токен авторизации                           | `setUser`, `setAccessToken`, `clearUser`                     |

### 🔌 RTK Query — работа с API

Два API-слайса обеспечивают взаимодействие с бэкендом `api.v2.react-learning.ru`:

- **`productsApi`** — получение списка товаров, детали товара, операции с лайками
- **`authApi`** — регистрация (`signUp`) и авторизация (`signIn`)

Конфигурация базового запроса (`src/shared/store/api/config.ts`) автоматически подставляет access token из Redux store в заголовки каждого запроса.

### 🔐 Аутентификация и HOC-защита

- **`WithProtection`** (HOC) — оборачивает защищённые страницы. Если пользователь не авторизован, перенаправляет на `/signin`, запоминая исходный URL для автоматического возврата после входа.
- **`WithQuery`** (HOC) — универсальная обёртка для отображения состояний загрузки и ошибок RTK Query.

### 🔍 Поиск с debounce

Поиск товаров реализован через `useSearchParams` (query-параметры `?q=`) с **debounce 500ms**, что позволяет:

- Не перегружать API на каждый символ
- Делиться ссылками с зашитой поисковой фразой

### ⬇️ Infinite scroll (Intersection Observer)

Подгрузка товаров при скролле реализована через **Intersection Observer API** (`src/shared/ui/LoadMore`). Каждый раз, когда «маячок» появляется в зоне видимости, увеличивается счётчик страниц и запрашивается следующая порция данных.

### 🛒 Корзина

Состояние корзины хранится в Redux. Функционал включает:

- Добавление товара со страницы каталога и детальной страницы
- Счётчик количества с валидацией (MIN 1, MAX 99, с учётом `stock`)
- Отображение количества товаров в «пузырьке» хедера
- Подсчёт итоговой суммы

### 🪟 Модальное окно (React Portal)

Модалка рендерится через `createPortal` в отдельный `<div id="modal-root">` и реализует полный набор **a11y-фич**:

- **Focus trap** — циклическая навигация Tab/Shift+Tab внутри модалки
- **Scroll lock** — блокировка прокрутки страницы
- **Закрытие по Escape** и по клику на overlay
- **Возврат фокуса** на элемент-триггер после закрытия
- Анимации через CSS transitions (opacity + transform + backdrop-filter blur)

📍 **Код:** `src/shared/ui/Modal/ui/Modal.tsx`

### 📝 Формы авторизации

Формы регистрации и входа построены на **react-hook-form** с интеграцией **yup** для валидации:

- Email — валидный формат
- Password — от 6 до 24 символов
- MUI-компоненты подключены через `<Controller>`
- Кнопка блокируется во время отправки и при невалидных данных

---

## 🚀 Оптимизация и производительность

### ✨ `memo` + кастомный компаратор — Card

Компонент `Card` обёрнут в `React.memo` с **кастомной функцией сравнения**:

```typescript
function areEqual(prevProps: CardProps, nextProps: CardProps) {
	return (
		prevProps.product.id === nextProps.product.id &&
		prevProps.isInCart === nextProps.isInCart
	);
}

export const Card = memo(CardComponent, areEqual);
```

Карточка перерисовывается только при изменении `product.id` или `isInCart`, а не при каждом обновлении родительского списка.

### ⚡ `useMemo` — CardList

В `CardList` мемоизированы:

- **`cartProductIds`** — `Set` ID товаров в корзине (пересоздаётся только при изменении `cartProducts`)
- **`productCards`** — массив JSX-элементов карточек (пересоздаётся только при изменении `products` или `cartProductIds`)

### 🔗 `useCallback` — обработчики

В `Card` обработчик `handleAddToCart` обёрнут в `useCallback`, чтобы не передавать новую функцию-ссылку в дочерние компоненты при каждом рендере.

### 🎯 `useMemo` в хуке `useProducts`

Фильтрация избранных товаров мемоизирована — выполняется только при изменении списка продуктов, флага страницы или ID пользователя.

### ⏱️ Debounce для поиска

`useDebounce` задерживает обновление поискового запроса на **500ms**, снижая количество API-вызовов при быстром вводе.

### ⚡ Оптимистичный UI — LikeButton

`LikeButton` использует React 19 хук **`useOptimistic`**:

```typescript
const [confirmedLike, setConfirmedLike] = useState(isLike);
const [optimisticLike, setOptimisticLike] = useOptimistic(confirmedLike);
```

Лайк мгновенно меняет визуальное состояние ещё до ответа сервера. Если запрос завершается ошибкой — состояние откатывается. Операции обёрнуты в `startTransition` для неблокирующих обновлений.

### 🖼️ Lazy loading изображений

Все изображения товаров в `Card` используют атрибут `loading='lazy'` для отложенной загрузки браузером.

### 📦 Webpack-оптимизации продакшн-сборки

- Content hash в именах бандлов (`[name].[contenthash].js`) — для долгосрочного кеширования
- `MiniCssExtractPlugin` — вынос CSS в отдельные файлы
- PostCSS с `cssnano` — минификация CSS
- `CleanWebpackPlugin` — очистка `dist` перед сборкой

---

## 📂 Структура проекта

```
src/
├── app/                      # Корневой компонент App, глобальные стили
│   ├── App.tsx               # Header + Sort + Outlet + Footer + ToastContainer
│   ├── styles/               # normalize.css, styles.css
│   └── app.module.css
│
├── pages/                    # Страницы приложения
│   ├── HomePage/             # Каталог товаров (с WithProtection + WithQuery)
│   ├── ProductPage/          # Детальная карточка товара, отзывы, модалка удаления
│   ├── FavoritesPage/        # Избранные товары
│   ├── CartPage/             # Корзина (CartList + CartAmount)
│   ├── ProfilePage/          # Профиль пользователя
│   ├── SignInPage/           # Страница входа
│   ├── SignUpPage/           # Страница регистрации
│   └── NotFoundPage/         # 404
│
├── widgets/                  # Композитные UI-блоки
│   ├── CardList/             # Список карточек (memo + useMemo)
│   ├── Header/               # Шапка с поиском, иконками, бейджами
│   ├── Footer/               # Подвал
│   └── ReviewList/           # Список отзывов + форма отзыва
│
├── features/                 # Бизнес-логика пользователя
│   └── auth/
│       ├── SignInForm/       # Форма входа (react-hook-form + yup)
│       └── SignUpForm/       # Форма регистрации
│
└── shared/                   # Переиспользуемый код
    ├── api/
    │   └── ApiServise.ts     # REST-клиент (класс Api, fetch wrapper)
    ├── assets/               # SVG-иконки
    ├── hooks/                # Кастомные хуки
    │   ├── useDebounce.ts    # Debounce для поиска
    │   ├── usePagination.ts  # Универсальная пагинация
    │   └── useAddToCart.ts   # Добавление в корзину
    ├── providers/
    │   └── router/           # React Router v6 конфигурация
    ├── store/
    │   ├── api/              # RTK Query слайсы (authApi, productsApi)
    │   ├── slices/           # Redux slices (user, cart, products)
    │   ├── hooks/            # useProducts (useMemo-фильтрация)
    │   ├── HOCs/             # WithProtection, WithQuery
    │   ├── store.ts          # configureStore
    │   ├── types.ts          # RootState, AppDispatch
    │   └── utils.ts          # useAppSelector, useAppDispatch
    ├── types/
    │   └── global.d.ts       # Глобальные типы (Product, User, Review...)
    ├── ui/                   # Переиспользуемые UI-компоненты
    │   ├── Button/           # MUI Button/LoadingButton обёртка
    │   ├── Input/            # MUI TextField обёртка
    │   ├── Card/             # Карточка товара (memo)
    │   ├── LikeButton/       # Кнопка лайка (useOptimistic)
    │   ├── Modal/            # Модалка (Portal + a11y)
    │   ├── Search/           # Поиск (debounce + useSearchParams)
    │   ├── Sort/             # Сортировка
    │   ├── CartCounter/      # Счётчик товаров в корзине
    │   ├── LoadMore/         # Infinite scroll (IntersectionObserver)
    │   ├── Rating/           # Рейтинг звёздами
    │   ├── Loader/           # Спиннер загрузки
    │   └── ...
    └── utils/                # Утилиты (isLiked, getMessageFromError)
```

---

## 🔧 Сравнение сборок

Проект поддерживает два бандлера: **Webpack 5** (основная) и **esbuild** (образовательная).

| Метрика       | Webpack                                  | esbuild                     |
| ------------- | ---------------------------------------- | --------------------------- |
| Время сборки  | ~16.8s                                   | ~548ms                      |
| Размер вывода | ~680 KB                                  | ~1.1 MB                     |
| CSS Modules   | MiniCssExtractPlugin                     | Встроенный CSS loader       |
| SVG           | @svgr/webpack                            | Кастомный плагин @svgr/core |
| Dev server    | webpack-dev-server (HMR + React Refresh) | —                           |
| Source maps   | eval-source-map (dev)                    | —                           |

**Вывод:** esbuild собирает в ~30 раз быстрее, но Webpack даёт более оптимизированный бандл с возможностью тонкой настройки и HMR.

---

## 💻 Инструкция по запуску

### 📦 Установка зависимостей

```bash
npm i
```

### ▶️ Запуск dev-сервера

```bash
npm start
```

Dev-сервер доступен по адресу **http://localhost:8080** (port настраивается в `webpack/webpack.dev.js`).

### 🏭 Production-сборка

```bash
# Webpack (основная сборка, вывод в ./dist)
npm run build

# esbuild (альтернативная, вывод в ./dist-esbuild)
npm run build:esbuild
```

### 🔍 Линтинг и форматирование

```bash
npm test                 # Stylelint → ESLint → Prettier (все линтеры)
npm run lint             # ESLint с автоисправлением
npm run stylelint:fix    # Stylelint с автоисправлением
npm run format           # Prettier с записью
```

### 💬 Коммиты

```bash
npm run commit           # Запуск тестов + Commitizen (conventional commits)
```

---

## 🌐 API

Бэкенд: `https://api.v2.react-learning.ru`

| Endpoint              | Метод      | Описание                                      |
| --------------------- | ---------- | --------------------------------------------- |
| `/auth/register`      | POST       | Регистрация пользователя                      |
| `/auth/login`         | POST       | Авторизация пользователя                      |
| `/products`           | GET        | Список товаров (пагинация, сортировка, поиск) |
| `/products/:id`       | GET        | Детали товара                                 |
| `/products/:id/likes` | PUT/DELETE | Добавление/удаление лайка                     |
| `/reviews/leave/:id`  | POST       | Создание отзыва                               |
| `/users/me`           | GET/PATCH  | Получение/обновление данных пользователя      |

---

## 📁 Важные файлы

| Файл                                            | Назначение                                                 |
| ----------------------------------------------- | ---------------------------------------------------------- |
| `src/index.tsx`                                 | Точка входа — StrictMode + Redux Provider + RouterProvider |
| `src/shared/store/store.ts`                     | Конфигурация Redux store с RTK Query middleware            |
| `src/shared/store/reducers/rootReducer.ts`      | Корневой редьюсер (combineReducers)                        |
| `src/shared/providers/router/config/router.tsx` | Маршруты (createBrowserRouter)                             |
| `src/shared/ui/Modal/ui/Modal.tsx`              | Модалка с Portal, focus trap, a11y                         |
| `src/shared/ui/LikeButton/ui/LikeButton.tsx`    | Оптимистичный UI (useOptimistic)                           |
| `src/shared/store/hooks/useProducts.ts`         | Хук получения товаров с фильтрацией                        |
| `webpack/webpack.common.js`                     | Общая конфигурация Webpack                                 |
| `esbuild.config.mjs`                            | Конфигурация esbuild                                       |
| `public/index.html`                             | HTML-шаблон с `<div id="modal-root">`                      |
