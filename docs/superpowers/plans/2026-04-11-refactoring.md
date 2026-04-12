# Реализация доработки проекта (Refactoring)

Данный план составлен для рефакторинга архитектуры существующего проекта.

## Принятые решения

> [!NOTE]
>
> 1. **React 19:** Обновление пакетов `react` и `react-dom` до версии 19 будет выполнено непосредственно в шаге `Task 7`, без преждевременных изменений. Мы обновим зависимости только тогда, когда проект будет готов к интеграции новых хуков.
> 2. **Esbuild:** Использование `esbuild` утверждено исключительно для образовательных целей (замер и сравнение скорости сборки с Webpack). Основной сборкой проекта останется Webpack.
> 3. **MUI-обёртки:** Компоненты `Button` и `Input` в `shared/ui` — это обёртки над MUI `LoadingButton`/`Button` и `TextField`, инкапсулирующие стороннюю зависимость. Компонент `Loader` — обёртка над существующим `Spinner`.
> 4. **Модалка:** Компонент `Modal` в `shared/ui` реализует полный цикл управления фокусом: начальный фокус на кнопку закрытия (крестик), trap фокуса внутри модалки, возврат фокуса на триггер при закрытии.

## User Review Required

> [!IMPORTANT]
>
> - **SignUpForm** переносится в `features/auth/` наравне с `SignInForm` — обе формы авторизации лежат в одной фиче.
> - **LikeButton** остаётся в `shared/ui/`, т.к. `useOptimistic` из React 19 будет применён непосредственно к нему (Task 7), а не к отдельному `FavoriteButton`.
> - **ReviewForm** остаётся в `widgets/ReviewList/`, но при реализации Task 7 может быть вынесен в отдельную фичу `features/reviews/`, если будет использоваться `useActionState`.
> - **Корзина (CartPage, CartItem, CartList, CartAmount)** остаётся внутри `pages/CartPage/ui/`, поскольку эти компоненты локальны для страницы. Вынос в `features/cart/` возможен, но увеличит объём работы без значительного выигрыша.

## Proposed Changes

### Слой Shared UI (Button, Input, Loader)

Выносим часто используемые компоненты в отдельный переиспользуемый `shared/ui` слой.

#### [NEW] src/shared/ui/Button/ui/Button.tsx

Обёртка над стандартным MUI `Button` из `@mui/material`. При передаче опционального пропа `loading` внутри используется `LoadingButton` из `@mui/lab`. Принимает только UI-пропсы (variant, disabled, loading?, children, onClick, type, fullWidth, sx). Без бизнес-логики, без стора, без API.

#### [NEW] src/shared/ui/Input/ui/Input.tsx

Обёртка над MUI `TextField`. Принимает только UI-пропсы (label, type, error, helperText, fullWidth, required, margin, autoComplete + spread от react-hook-form `field`). Совместима с `Controller` из react-hook-form.

#### [NEW] src/shared/ui/Loader/ui/Loader.tsx

Реэкспорт / алиас существующего `Spinner` компонента для единообразия именования. Сам `Spinner` остаётся, `Loader` просто переэкспортирует его.

---

### Слой Features (Авторизация — auth)

Реструктуризация: перенос форм авторизации из `widgets/` в `features/auth/`.

#### [MOVE] src/widgets/SignInForm/ → src/features/auth/SignInForm/

#### [MOVE] src/widgets/SignUpForm/ → src/features/auth/SignUpForm/

Перемещение логики обеих форм авторизации в папку фич. Внедрение созданных UI-компонентов (Button, Input) вместо прямого импорта MUI.

#### [MODIFY] src/pages/SignInPage/ui/SignInPage.tsx

#### [MODIFY] src/pages/SignUpPage/ui/SignUpPage.tsx

Обновление путей импорта на новое расположение форм.

---

### React.Portal и Модальное окно

Создание базовой инфраструктуры для модалок.

#### [MODIFY] public/index.html

Добавление корня портала `<div id="modal-root"></div>` после `<div id="root"></div>`.

#### [NEW] src/shared/ui/Modal/ui/Modal.tsx

#### [NEW] src/shared/ui/Modal/ui/Modal.module.css

#### [NEW] src/shared/ui/Modal/index.ts

Реализация модального окна на основе `ReactDOM.createPortal`:

- **Закрытие:** клик по иконке крестика, клик вне области модалки (overlay), нажатие `Escape`.
- **Управление фокусом:**
  - а) При открытии — начальный фокус устанавливается на кнопку закрытия (иконку крестика).
  - б) Trap-фокуса — Tab/Shift+Tab зацикленно переключается между фокусируемыми элементами внутри модалки.
  - в) При закрытии — фокус возвращается на элемент-триггер (запоминается через `document.activeElement` перед открытием).
- **Scroll lock:** `document.body.style.overflow = 'hidden'` при открытии, восстановление при закрытии.

#### Интеграция модалки

Для демонстрации — добавить кнопку "Удалить товар" в `ProductPage`, открывающую модальное окно подтверждения удаления.

---

### useRef — реальное применение

#### [MODIFY] src/features/auth/SignInForm/ui/SignInForm.tsx

Автофокус на поле Email при монтировании компонента через `useRef` + `useEffect`.

#### [MODIFY] src/shared/ui/Modal/ui/Modal.tsx

- `useRef` для запоминания `document.activeElement` (триггера) перед открытием.
- `useRef` для кнопки закрытия (крестик) для установки начального фокуса.

#### useRef без ререндера (счётчик)

#### [NEW] src/shared/ui/Modal/ui/Modal.tsx (дополнение) или отдельный хук

Пример использования `useRef` для хранения состояния между рендерами без перерендера — счётчик открытий модалки (`openCountRef.current++`), который логируется в консоль, но не вызывает ререндер.

---

### Оптимизация рендеров

#### [MODIFY] src/shared/ui/Card/ui/Card.tsx

Обернуть компонент `Card` в `React.memo` для предотвращения лишних рендеров при переотрисовке списка.

#### [MODIFY] src/widgets/CardList/ui/CardList.tsx

- `useMemo` для мемоизации отфильтрованного/маппированного массива продуктов, если есть вычисления.
- `useCallback` для мемоизации колбэков, передаваемых дочерним компонентам.

#### [MODIFY] src/shared/ui/Card/ui/Card.tsx

- `useCallback` для мемоизации `addProductToCart` колбэка, чтобы не пересоздавать функцию на каждый рендер.

#### Профилирование

Использовать React DevTools Profiler для поиска hotspot'ов до и после оптимизации. Зафиксировать результаты.

---

### Сборка esbuild

#### [NEW] esbuild.config.mjs

Конфигурация esbuild с поддержкой:

- TypeScript + JSX (loader: `.tsx` → `tsx`, `.ts` → `ts`).
- CSS modules (через плагин или inline).
- Копирование `public/index.html` с инъекцией `<script>`.
- Переменные окружения (`process.env.NODE_ENV`, `.env`).
- SVG импорт (через dataurl или плагин).

#### [MODIFY] package.json

Добавление скрипта `"build:esbuild": "node esbuild.config.mjs"`.
Добавление `esbuild` в `devDependencies`.

#### [MODIFY] README.md

Таблица сравнения: время сборки (секунды) и размер output'а Webpack vs esbuild.

---

### React 19 Hooks

#### [MODIFY] package.json

Обновление `react`, `react-dom` до `^19.0.0`, `@types/react`, `@types/react-dom` до `^19.0.0`.

#### [MODIFY] src/shared/ui/LikeButton/ui/LikeButton.tsx

Применение `useOptimistic` для мгновенного переключения UI лайка ДО ответа сервера:

- Оптимистично переключаем `isLike` состояние.
- При ошибке — откатываем.

**Обоснование:** `useOptimistic` идеально подходит для лайков — действие мгновенное, откат редкий, UX значительно улучшается.

---

## Пошаговые задачи (Bite-sized Task Granularity)

### Task 1: Архитектура Shared UI (Button, Input, Loader)

**Files:**

- Create: `src/shared/ui/Button/ui/Button.tsx`, `src/shared/ui/Button/index.ts`
- Create: `src/shared/ui/Input/ui/Input.tsx`, `src/shared/ui/Input/index.ts`
- Create: `src/shared/ui/Loader/ui/Loader.tsx`, `src/shared/ui/Loader/index.ts`

- [x] **Step 1: Создание компонента Button**
      Обернуть стандартный MUI `Button` из `@mui/material` в наш собственный компонент. При наличии опционального пропа `loading` — внутри рендерить `LoadingButton` из `@mui/lab`.
      Props: `variant`, `disabled`, `loading?`, `children`, `onClick`, `type`, `fullWidth`, `sx`.
      Добавить barrel-экспорт через `index.ts`.

- [x] **Step 2: Создание компонента Input**
      Обернуть MUI `TextField` в наш собственный компонент `Input`.
      Props: `label`, `type`, `error`, `helperText`, `fullWidth`, `required`, `margin`, `autoComplete`, `inputRef` + rest.
      Должен быть совместим с `Controller` из react-hook-form (спред `field`).
      Добавить barrel-экспорт через `index.ts`.

- [x] **Step 3: Создание компонента Loader**
      Реэкспортировать существующий `Spinner` как `Loader` для единообразия.
      `export { Spinner as Loader } from '../../Spinner'`.

- [x] **Step 4: Проверка чеклиста**
      Убедиться: в `shared/ui` лежат только презентационные компоненты. `Button`, `Input`, `Loader` — без бизнес-логики, без API, без стора.

- [x] **Step 5: Commit**
      `git commit -m "refactor: extract Button, Input, Loader to shared/ui"`

---

### Task 2: Разделение по фичам (Features layer)

**Files:**

- Move: `src/widgets/SignInForm/` → `src/features/auth/SignInForm/`
- Move: `src/widgets/SignUpForm/` → `src/features/auth/SignUpForm/`
- Modify: `src/pages/SignInPage/ui/SignInPage.tsx`
- Modify: `src/pages/SignUpPage/ui/SignUpPage.tsx`

- [x] **Step 1: Перенос SignInForm**
      Переместить `src/widgets/SignInForm/` в `src/features/auth/SignInForm/`.

- [x] **Step 2: Перенос SignUpForm**
      Переместить `src/widgets/SignUpForm/` в `src/features/auth/SignUpForm/`.

- [x] **Step 3: Обновление путей импорта**
      В `SignInPage.tsx` и `SignUpPage.tsx` обновить пути на `../../features/auth/...`.

- [x] **Step 4: Внедрение shared/ui компонентов**
      В обеих формах заменить прямые импорты MUI (`LoadingButton`, `TextField`) на `Button` и `Input` из `shared/ui`.
      Обновить внутренние пути к стору (`../../../shared/store/...` → `../../../shared/store/...` — пересчитать относительные пути).

- [x] **Step 5: Проверка чеклиста**

  - Фичи изолированы в `features/auth/`.
  - Нет глубоких prop-chain без необходимости.
  - Приложение запускается без ошибок (`npm run start`).

- [x] **Step 6: Commit**
      `git commit -m "refactor: move auth forms to features/auth, integrate shared/ui"`

---

### Task 3: React.Portal Modal

**Files:**

- Modify: `public/index.html`
- Create: `src/shared/ui/Modal/ui/Modal.tsx`
- Create: `src/shared/ui/Modal/ui/Modal.module.css`
- Create: `src/shared/ui/Modal/index.ts`

- [x] **Step 1: Добавление контейнера в DOM**
      В `index.html` после `<div id="root"></div>` добавить `<div id="modal-root"></div>`.

- [x] **Step 2: Разработка Modal компонента**
      Создать переиспользуемый компонент на `ReactDOM.createPortal`:

  - Props: `isOpen: boolean`, `onClose: () => void`, `children: ReactNode`, `title?: string`.
  - Overlay с полупрозрачным фоном.
  - Кнопка закрытия (иконка крестика) в шапке модалки.
  - Закрытие по: клику на крестик, клику на overlay, нажатию Escape.

- [x] **Step 3: Управление фокусом**

  - При открытии: `useRef` запоминает `document.activeElement` (триггер). Фокус устанавливается на кнопку закрытия (крестик) через `closeButtonRef.current?.focus()`.
  - Tab trap: обработчик `keydown` зацикливает Tab по фокусируемым элементам внутри модалки.
  - При закрытии: фокус возвращается на сохранённый триггер-элемент.

- [x] **Step 4: Scroll lock**
      При открытии: `document.body.style.overflow = 'hidden'`.
      При закрытии: восстановление.

- [x] **Step 5: Стили модалки**
      CSS-модуль с оверлеем, контентной областью, анимацией появления.

- [x] **Step 6: Интеграция модалки**
      На `ProductPage` добавить кнопку "Удалить товар", открывающую модальное окно подтверждения.

- [x] **Step 7: Commit**
      `git commit -m "feat: implement Modal portal with focus management"`

---

### Task 4: Использование useRef

**Files:**

- Modify: `src/features/auth/SignInForm/ui/SignInForm.tsx`
- Modify: `src/shared/ui/Modal/ui/Modal.tsx` (уже содержит useRef из Task 3)

- [x] **Step 1: Автофокус на инпут email**
      В `SignInForm` добавить `useRef<HTMLInputElement>()` и `useEffect` для автофокуса на email поле при монтировании. Пробросить ref через `inputRef` проп нового `Input` компонента.

- [x] **Step 2: useRef без ререндера**
      В `Modal` добавить `openCountRef = useRef(0)`. При каждом открытии модалки инкрементировать счётчик и логировать в консоль: `console.log('Modal opened', openCountRef.current, 'times')`. Это демонстрирует хранение значения между рендерами без вызова ререндера.

- [x] **Step 3: Проверка чеклиста**

  - Есть пример `useRef` без ререндера (счётчик).
  - Есть автофокус на DOM-элемент.
  - Фокус в Modal обрабатывается корректно (из Task 3).

- [x] **Step 4: Commit**
      `git commit -m "feat: useRef autofocus and render-free counter"`

---

### Task 5: Оптимизация рендеров

**Files:**

- Modify: `src/shared/ui/Card/ui/Card.tsx`
- Modify: `src/widgets/CardList/ui/CardList.tsx`

- [x] **Step 1: Профилирование (before)**
      Открыть React DevTools Profiler. Записать рендеры при скролле / поиске. Найти hotspot (Card перерендеривается при каждом изменении).

- [x] **Step 2: React.memo на Card**
      Обернуть `Card` в `React.memo`. Добавить кастомный comparator, если нужно (сравнение по `product.id`).

- [x] **Step 3: useCallback в Card**
      Мемоизировать `addProductToCart` колбэк через `useCallback` (зависимость — `product`).

- [x] **Step 4: useMemo в CardList**
      Если есть вычисления в маппинге — обернуть в `useMemo`. Мемоизировать массив `products.map(...)` если целесообразно.

- [x] **Step 5: Профилирование (after)**
      Повторить профилирование, зафиксировать разницу.

  **Результаты:**

  - До: 8.9ms на перерисовку всех ~10+ карточек
  - После: ~0.1-0.4ms, рендерится только 1-2 карточки
  - Улучшение: в 20-80 раз быстрее

- [x] **Step 6: Commit**
      `git commit -m "perf: memoize Card, optimize CardList rendering"`

---

### Task 6: Custom Bundler (esbuild)

**Files:**

- Create: `esbuild.config.mjs`
- Modify: `package.json`
- Modify: `README.md`

- [ ] **Step 1: Установка esbuild**
      `npm install --save-dev esbuild`

- [ ] **Step 2: Базовая конфигурация**
      Создать `esbuild.config.mjs` с настройками:

  - `entryPoints: ['src/index.tsx']`
  - `bundle: true`, `minify: true`
  - `outdir: 'dist-esbuild'`
  - Loaders для `.tsx`, `.ts`, `.css`, `.svg`, `.png`, `.jpg`
  - `define: { 'process.env.NODE_ENV': '"production"' }`
  - Замер времени сборки через `console.time`/`console.timeEnd`.

- [ ] **Step 3: Скрипт в package.json**
      Добавить `"build:esbuild": "node esbuild.config.mjs"`.

- [ ] **Step 4: Запуск и сравнение**
      Выполнить `npm run build` и `npm run build:esbuild`. Записать время и размер.

- [ ] **Step 5: Обновление README.md**
      Добавить таблицу сравнения:
      | Bundler | Build Time | Output Size |
      |---------|-----------|-------------|
      | Webpack | ... | ... |
      | esbuild | ... | ... |

- [ ] **Step 6: Commit**
      `git commit -m "chore: add esbuild build config with benchmark"`

---

### Task 7: React 19 Hooks

**Files:**

- Modify: `package.json`
- Modify: `src/shared/ui/LikeButton/ui/LikeButton.tsx`

- [ ] **Step 1: Обновление React до v19**

  ```
  npm install react@19 react-dom@19
  npm install --save-dev @types/react@19 @types/react-dom@19
  ```

  Проверить, что проект собирается и запускается.

- [ ] **Step 2: Исправление breaking changes**
      Если есть ошибки после обновления — исправить (типичные: изменение типов, удалённые API).

- [ ] **Step 3: Применение useOptimistic в LikeButton**
      В `LikeButton.tsx`:

  - Добавить `const [optimisticLike, setOptimisticLike] = useOptimistic(isLike)`.
  - В `toggleLike`: сначала `setOptimisticLike(!isLike)`, затем вызов API.
  - UI рендерит на основе `optimisticLike` вместо `isLike`.
  - При ошибке API — RTK Query автоматически инвалидирует кеш, `isLike` откатится.

- [ ] **Step 4: Проверка**

  - UI лайка переключается мгновенно (до ответа сервера).
  - При ошибке — откат.

- [ ] **Step 5: Commit**
      `git commit -m "feat: upgrade to React 19, apply useOptimistic to LikeButton"`

---

## Verification Plan

### Automated Tests

- `npm run start` — проект запускается без ошибок после каждого шага.
- `npm run build` — production-сборка Webpack проходит без ошибок.
- `npm run build:esbuild` — esbuild-сборка проходит без ошибок (лог времени в консоли).
- `npm run lint` / `npm run stylelint` — линтеры проходят без новых ошибок.

### Manual Verification

- **Shared UI:** `Button`, `Input`, `Loader` используются в формах авторизации вместо прямых MUI-импортов.
- **Features:** Формы авторизации работают корректно из нового расположения.
- **Modal:** Открытие/закрытие по крестику, overlay, Escape. Фокус на крестик при открытии, возврат на триггер при закрытии.
- **useRef:** Автофокус на email-инпут при монтировании SignInForm. Счётчик открытий модалки выводится в консоль без ререндера.
- **Оптимизация:** React DevTools Profiler — подтверждение уменьшения ререндеров Card.
- **React 19:** Лайк переключается мгновенно, при ошибке — откат.

## Чек-лист соответствия требованиям

| #   | Требование                                                     | Покрыто задачей |
| --- | -------------------------------------------------------------- | --------------- |
| 1   | UI-компоненты в shared/ui (Button, Input, Loader)              | Task 1          |
| 1   | Фичи изолированы в отдельных папках                            | Task 2          |
| 1   | Нет глубоких prop-chain без необходимости                      | Task 2          |
| 2   | Profiler — найден hotspot                                      | Task 5          |
| 2   | React.memo применяется эффективно                              | Task 5          |
| 2   | useMemo/useCallback оптимизируют вычисления                    | Task 5          |
| 3   | Модальное окно через портал                                    | Task 3          |
| 3   | Закрытие: крестик, overlay, Escape                             | Task 3          |
| 3   | Фокус на крестик при открытии, возврат на триггер при закрытии | Task 3          |
| 4   | useRef без ререндера                                           | Task 4          |
| 4   | Автофокус или DOM-взаимодействие                               | Task 4          |
| 5   | Сборка esbuild/SWC работает                                    | Task 6          |
| 5   | Сравнение в README                                             | Task 6          |
| 6   | useOptimistic применён                                         | Task 7          |
| 6   | UI реагирует до ответа сервера                                 | Task 7          |
