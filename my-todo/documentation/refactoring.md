# Code Review & Refactoring Plan

## Дата: 2026-01-27
## Автор: Code Review

---

## 🔴 КРИТИЧЕСКИЕ ПРОБЛЕМЫ С ПРОИЗВОДИТЕЛЬНОСТЬЮ

### 1. **Зависимости в useCallback вызывают постоянные пересоздания функций**

#### Проблема в [TasksFetch.tsx:127-149](src/components/TasksFetch/TasksFetch.tsx#L127-L149)

```tsx
// ❌ ПЛОХО - функция пересоздается на КАЖДОМ рендере
const moveTaskToColumn = useCallback(async (taskId: string, targetColumnId: string) => {
  const task = todos.find(t => t.id === taskId);
  // ...
}, [todos]); // 👈 todos меняется постоянно!

const toggleTask = useCallback((taskId: string) => {
  // ...
}, [todos, moveTaskToColumn]); // 👈 обе зависимости меняются постоянно!
```

**Последствия:**
- При вводе в input меняется состояние → пересоздается `todos` → пересоздаются ВСЕ callback'и
- Дочерние компоненты получают новые ссылки на функции → лишние ре-рендеры
- React.memo не работает, т.к. пропсы всегда "новые"

**Решение:**
```tsx
// ✅ ХОРОШО - используем функциональное обновление
const moveTaskToColumn = useCallback(async (taskId: string, targetColumnId: string) => {
  setTodos(currentTodos => {
    const task = currentTodos.find(t => t.id === taskId);
    if (!task) return currentTodos;

    return currentTodos.map(t =>
      t.id === taskId ? {...t, columnId: targetColumnId } : t
    );
  });
}, []); // 👈 пустой массив зависимостей!
```

---

### 2. **Двойное обновление состояния в updateTaskTitle**

#### Проблема в [TasksFetch.tsx:192-213](src/components/TasksFetch/TasksFetch.tsx#L192-L213)

```tsx
// ❌ ПЛОХО - setTodos вызывается ДВА РАЗА
const updateTaskTitle = useCallback(async (taskId: string, newTitle: string) => {
  const updTodos = todos.map((task) =>
    task.id === taskId ? { ...task, title: newTitle.trim() } : task,
  );
  setTodos(updTodos); // 👈 первый раз

  await updateTodo(taskId, { title: newTitle.trim() });

  setTodos(updTodos); // 👈 второй раз - зачем???
}, [todos]);
```

**Последствия:**
- Два ре-рендера вместо одного
- Падение производительности при редактировании

**Решение:**
```tsx
// ✅ ХОРОШО
const updateTaskTitle = useCallback(async (taskId: string, newTitle: string) => {
  if (newTitle.trim() === "") return;

  setTodos(currentTodos =>
    currentTodos.map((task) =>
      task.id === taskId ? { ...task, title: newTitle.trim() } : task
    )
  );

  try {
    await updateTodo(taskId, { title: newTitle.trim() });
  } catch (error) {
    console.error("Error updating task title:", error);
    // Rollback на предыдущее состояние
    setTodos(currentTodos =>
      currentTodos.map(task =>
        task.id === taskId ? { ...task, title: oldTitle } : task
      )
    );
  }
}, []);
```

---

### 3. **Input onChange без debounce**

#### Проблема в [TasksFetch.tsx:282](src/components/TasksFetch/TasksFetch.tsx#L282)

```tsx
// ❌ ПЛОХО - обновление на КАЖДУЮ букву
<TextField
  value={newTaskTitle}
  onChange={(e) => setNewTaskTitle(e.target.value)} // 👈 рендер на каждый символ
/>
```

**Последствия:**
- При быстром наборе текста происходит ре-рендер на каждую букву
- Пересоздаются все callback'и (из-за проблемы #1)
- Пересчитывается `tasksByColumn` useMemo
- Лаги и подвисания интерфейса

**Решение 1 (простой):**
```tsx
// ✅ Контролируемый input без оптимизации
// Но фиксируем проблемы #1 и #2 - и все будет быстро
```

**Решение 2 (продвинутый):**
```tsx
import { useDeferredValue } from 'react';

const [newTaskTitle, setNewTaskTitle] = useState("");
const deferredTitle = useDeferredValue(newTaskTitle);
```

---

### 4. **Компоненты не обернуты в React.memo**

#### Проблема в [Task.tsx:23](src/components/Task/Task.tsx#L23) и [TaskList.tsx:14](src/components/TaskList/TaskList.tsx#L14)

```tsx
// ❌ ПЛОХО - ре-рендерится при любом изменении родителя
function Task({ task, users, onToggle, ... }) { ... }
```

**Последствия:**
- При изменении `newTaskTitle` → ре-рендер TasksFetch → ре-рендер ВСЕХ Task компонентов
- Десятки лишних ре-рендеров на одно нажатие клавиши

**Решение:**
```tsx
// ✅ ХОРОШО
import { memo } from 'react';

const Task = memo(function Task({ task, users, onToggle, ... }) {
  // ...
});

export default Task;
```

---

### 5. **🚨 КРИТИЧНО: Задачи НЕ сохраняются в localStorage**

#### Проблема в [TasksFetch.tsx:63-80](src/components/TasksFetch/TasksFetch.tsx#L63-L80)

```tsx
// ❌ ПЛОХО - задачи загружаются только из API
useEffect(() => {
  Promise.all([fetchTodos(), fetchUsers()])
    .then(([apiTodos, usersData]) => {
      const appTodos: Todo[] = apiTodos.map(/* ... */);
      setTodos(appTodos); // 👈 только из API, не из localStorage!
    })
}, []);

// ❌ ПЛОХО - нет сохранения задач в localStorage при изменении
// Сравни с колонками (строки 187-189):
useEffect(() => {
  localStorage.setItem('columns', JSON.stringify(columns)); // ✅ колонки сохраняются
}, [columns]);

// Но для задач такого эффекта НЕТ! ❌
```

**Последствия:**
- При перезагрузке страницы все изменения задач теряются
- Пользователь теряет данные при закрытии вкладки
- Работа с API происходит каждый раз при загрузке

**Почему это критично:**
- Пользователь ожидает, что его данные сохранятся локально
- API может быть недоступен, но локальные данные останутся
- Плохой UX - потеря несохраненных изменений

**Решение:**

```tsx
// ✅ ХОРОШО - инициализация с localStorage
const [todos, setTodos] = useState<Todo[]>(() => {
  const saved = localStorage.getItem('todos');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
});

// ✅ Загрузка из API с merge локальных изменений
useEffect(() => {
  Promise.all([fetchTodos(), fetchUsers()])
    .then(([apiTodos, usersData]) => {
      const appTodos: Todo[] = apiTodos.map((apiTodo) => ({
        ...apiTodo,
        id: String(apiTodo.id),
        columnId: apiTodo.completed ? COMPLETED_COLUMN_ID : "progress",
      }));

      setUsers(usersData);

      // Если в localStorage есть данные - используем их
      // API данные - только fallback
      const savedTodos = localStorage.getItem('todos');
      if (!savedTodos) {
        setTodos(appTodos);
      }
    })
    .catch(() => setError("Ошибка в получении контента"))
    .finally(() => setIsLoadingTasks(false));
}, []);

// ✅ ХОРОШО - сохранение в localStorage при изменении
useEffect(() => {
  if (todos.length > 0 || localStorage.getItem('todos')) {
    localStorage.setItem('todos', JSON.stringify(todos));
  }
}, [todos]);
```

**Альтернативный подход (с синхронизацией):**
```tsx
// Если нужна синхронизация API + localStorage:
const [todos, setTodos] = useState<Todo[]>(() => {
  const saved = localStorage.getItem('todos');
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  // Загружаем из API в фоне
  fetchTodos().then(apiTodos => {
    const localTodos = JSON.parse(localStorage.getItem('todos') || '[]');

    // Merge: локальные изменения приоритетнее
    const merged = mergeTodos(localTodos, apiTodos);
    setTodos(merged);
  });
}, []);

// Автосохранение
useEffect(() => {
  localStorage.setItem('todos', JSON.stringify(todos));
}, [todos]);
```

**Важно:**
- Добавить версионирование схемы данных в localStorage
- Обрабатывать случай, когда localStorage заполнен (quota exceeded)
- Очищать старые данные при logout/reset

```tsx
// Добавить в начало файла
const STORAGE_VERSION = '1.0';
const TODOS_STORAGE_KEY = 'todos_v' + STORAGE_VERSION;

// Использовать вместо 'todos'
localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
```

---

## 🟡 ПРОБЛЕМЫ КАЧЕСТВА КОДА

### 6. **Закомментированный мертвый код**

#### Проблема в [TasksFetch.tsx:105-125](src/components/TasksFetch/TasksFetch.tsx#L105-L125), [176-186](src/components/TasksFetch/TasksFetch.tsx#L176-L186)

```tsx
// ❌ ПЛОХО - 50+ строк закомментированного кода
// const toggleTask = useCallback(
//   async (taskId: number) => {
//     setColor(color === "red" ? "green" : "red");
//     ...
```

**Решение:**
- Удалить весь закомментированный код
- Git history сохранит старые версии, если понадобятся

---

### 7. **Неиспользуемый код и переменные**

#### Проблема:
```tsx
// ❌ ПЛОХО - переменная объявлена, но не используется
const [color, setColor] = useState<"red" | "green">("green"); // строка 48

// ❌ ПЛОХО - импорт не используется
import { Opacity } from "@mui/icons-material"; // Task.tsx:12
```

**Решение:**
- Удалить все неиспользуемые переменные и импорты
- Настроить ESLint правило `no-unused-vars`

---

### 8. **Console.log в production коде**

#### Проблема в [Task.tsx:57](src/components/Task/Task.tsx#L57) и [TaskList.tsx:23](src/components/TaskList/TaskList.tsx#L23)

```tsx
// ❌ ПЛОХО
console.log('users in Task: ', users);
console.log("Tasks: ", tasks);
```

**Решение:**
- Удалить или заменить на debug логгер
```tsx
if (import.meta.env.DEV) {
  console.log('users in Task: ', users);
}
```

---

### 9. **Несоответствие типов ID**

#### Проблема в [Task.tsx:17-18](src/components/Task/Task.tsx#L17-L18)

```tsx
interface TaskProps {
  onToggle: (id: number) => void;     // 👈 number
  onUpdateTitle: (taskId: number, ...) // 👈 number
  // ...
}

// Но в TasksFetch.tsx:
const toggleTask = useCallback((taskId: string) => { ... }); // 👈 string!
```

**Последствия:**
- Потенциальные баги при сравнении ID
- Ошибки типизации TypeScript

**Решение:**
- Привести к единому типу (лучше `string` для ID от API)
```tsx
interface TaskProps {
  onToggle: (id: string) => void;
  onUpdateTitle: (taskId: string, newTitle: string) => void;
  onDelete: (taskId: string) => void;
  deletingTaskId: string | null;
}
```

---

### 10. **Отсутствие обработки ошибок**

#### Проблема в [TasksFetch.tsx:131-138](src/components/TasksFetch/TasksFetch.tsx#L131-L138)

```tsx
// ❌ ПЛОХО - API ошибка не обрабатывается
try {
  const updatedTodos = todos.map(/* ... */);
  setTodos(updatedTodos);
} catch (error) {
  console.error('Error moving task:', error); // 👈 только лог, UI не обновляется
}
```

**Решение:**
- Добавить rollback состояния при ошибке
- Показать пользователю уведомление об ошибке

---

### 11. **Отсутствие возможности изменить исполнителя задачи**

#### Проблема в [Task.tsx:94-110](src/components/Task/Task.tsx#L94-L110) и [TasksFetch.tsx](src/components/TasksFetch/TasksFetch.tsx)

```tsx
// ❌ ПЛОХО - исполнитель показывается, но нельзя изменить
<Typography
  sx={{ /* ... */ }}
  onClick={() => setIsEditing(true)} // 👈 открывает редактирование только title
>
  {user ? `${user.name} · ${user.email}` : 'Исполнитель не назначен'}
</Typography>
```

**Последствия:**
- Задачу можно создать с исполнителем, но потом нельзя переназначить
- При изменении команды или приоритетов задача навсегда "привязана" к одному человеку
- Плохой UX - видимая информация выглядит как кликабельная, но ничего не делает
- Нет функции `onUpdateAssignee` - API вызов не реализован

**Почему это важно:**
- В реальных проектах исполнитель часто меняется
- Типичный сценарий: задача переходит от одного разработчика к другому
- Пользователь ожидает редактирование по клику (как с title)

**Решение:**

#### Шаг 1: Добавить состояние для редактирования исполнителя

```tsx
// Task.tsx
function Task({ task, users, onToggle, onUpdateTitle, onUpdateAssignee, onDelete, deletingTaskId }: TaskProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(task.title);
  const [isEditingAssignee, setIsEditingAssignee] = useState(false); // 👈 новое
  const [editingUserId, setEditingUserId] = useState(task.userId);   // 👈 новое

  const handleSaveAssignee = () => {
    onUpdateAssignee(task.id, editingUserId);
    setIsEditingAssignee(false);
  };

  // ...
}
```

#### Шаг 2: Обновить UI с возможностью выбора исполнителя

```tsx
// Task.tsx - в блоке отображения
{isEditingAssignee ? (
  <Select
    size="small"
    value={editingUserId}
    onChange={(e) => setEditingUserId(Number(e.target.value))}
    onBlur={handleSaveAssignee}
    autoFocus
    sx={{ minWidth: 200 }}
  >
    {users.map((user) => (
      <MenuItem key={user.id} value={user.id}>
        {user.name}
      </MenuItem>
    ))}
  </Select>
) : (
  <Typography
    sx={{
      maxWidth: 240,
      cursor: 'pointer',
      '&:hover': { bgcolor: 'action.hover' }, // 👈 визуальная подсказка
      px: 1,
      py: 0.5,
      borderRadius: 1,
    }}
    onClick={() => setIsEditingAssignee(true)} // 👈 открывает редактор
  >
    {user ? `${user.name} · ${user.email}` : 'Исполнитель не назначен'}
  </Typography>
)}
```

#### Шаг 3: Добавить обработчик в TasksFetch

```tsx
// TasksFetch.tsx
interface TaskListProps {
  // ...
  onUpdateAssignee: (taskId: string, newUserId: number) => void; // 👈 новый проп
}

const updateTaskAssignee = useCallback(async (taskId: string, newUserId: number) => {
  try {
    setTodos(currentTodos =>
      currentTodos.map((task) =>
        task.id === taskId ? { ...task, userId: newUserId } : task
      )
    );

    await updateTodo(taskId, { userId: newUserId });
  } catch (error) {
    console.error("Error updating task assignee:", error);
    setError("Ошибка при изменении исполнителя");

    // Rollback при ошибке
    setTodos(currentTodos =>
      currentTodos.map((task) =>
        task.id === taskId ? { ...task, userId: task.userId } : task
      )
    );
  }
}, []);

// Передать в TaskList
<TaskList
  // ...
  onUpdateAssignee={updateTaskAssignee}
/>
```

#### Шаг 4: Обновить типы

```tsx
// Task.tsx - интерфейс
interface TaskProps {
  task: Todo;
  users: User[];
  onToggle: (id: string) => void;
  onUpdateTitle: (taskId: string, newTitle: string) => void;
  onUpdateAssignee: (taskId: string, newUserId: number) => void; // 👈 новый
  onDelete: (taskId: string) => void;
  deletingTaskId: string | null;
}
```

**Альтернативный вариант (inline редактирование):**

Вместо Select можно использовать Autocomplete с поиском:

```tsx
import { Autocomplete, TextField } from '@mui/material';

<Autocomplete
  size="small"
  value={users.find(u => u.id === editingUserId) || null}
  onChange={(_, newValue) => {
    if (newValue) {
      setEditingUserId(newValue.id);
      onUpdateAssignee(task.id, newValue.id);
      setIsEditingAssignee(false);
    }
  }}
  options={users}
  getOptionLabel={(user) => user.name}
  renderInput={(params) => <TextField {...params} label="Исполнитель" />}
  sx={{ minWidth: 200 }}
/>
```

**Дополнительные улучшения:**

1. **Показывать аватар пользователя:**
```tsx
<Box display="flex" alignItems="center" gap={1}>
  <Avatar sx={{ width: 24, height: 24 }}>
    {user?.name.charAt(0)}
  </Avatar>
  <Typography>{user?.name}</Typography>
</Box>
```

2. **Добавить визуальную индикацию hover:**
```tsx
sx={{
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    bgcolor: 'action.hover',
    transform: 'scale(1.02)',
  }
}}
```

3. **Keyboard shortcuts:**
```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape') {
    setIsEditingAssignee(false);
    setEditingUserId(task.userId); // reset
  }
};
```

---

### 12. **Опечатки в UI**

#### Проблема в [TasksFetch.tsx:374](src/components/TasksFetch/TasksFetch.tsx#L374)

```tsx
+Добавиь колонку  // 👈 "Добавиь" вместо "Добавить"
```

---

## 🟢 РЕКОМЕНДАЦИИ ПО АРХИТЕКТУРЕ

### 13. **Слишком много ответственности в TasksFetch**

**Проблема:**
- 400 строк кода в одном компоненте
- Управление задачами + колонками + пользователями + UI состояниями

**Решение:**
Разделить на:
```
hooks/
  useTasksManager.ts   - логика работы с задачами
  useColumnsManager.ts - логика работы с колонками
  useUsers.ts          - логика загрузки пользователей

components/
  TasksFetch/
    TasksFetch.tsx     - только UI композиция
    TaskCreator.tsx    - форма создания задачи
    ColumnCreator.tsx  - форма создания колонки
```

---

### 14. **Дублирование логики генерации ID**

#### Проблема в [TasksFetch.tsx:151-156](src/components/TasksFetch/TasksFetch.tsx#L151-L156)

```tsx
const generateColumnId = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '');
};
```

**Решение:**
- Вынести в `utils/stringUtils.ts`
- Покрыть unit-тестами

---

## 📊 ПРИОРИТИЗАЦИЯ ИСПРАВЛЕНИЙ

### Срочно (блокирует функциональность и производительность):
1. 🚨 **КРИТИЧНО** - Добавить сохранение задач в localStorage (проблема #5)
2. ✅ Исправить зависимости в `useCallback` → функциональные обновления (проблема #1)
3. ✅ Удалить двойной `setTodos` в `updateTaskTitle` (проблема #2)
4. ✅ Обернуть Task и TaskList в `React.memo` (проблема #4)

### Важно (функциональность и качество кода):
5. ⭐ Добавить возможность изменить исполнителя задачи (проблема #11)
6. ✅ Привести типы ID к единому формату (проблема #9)
7. ✅ Удалить закомментированный код (проблема #6)
8. ✅ Удалить неиспользуемые переменные и импорты (проблема #7)
9. ✅ Удалить console.log (проблема #8)
10. ✅ Исправить опечатку "Добавиь" → "Добавить" (проблема #12)

### Желательно (архитектура):
11. ⚠️ Разбить TasksFetch на мелкие компоненты (проблема #13)
12. ⚠️ Вынести логику в custom hooks (проблема #13)
13. ⚠️ Добавить debounce для input (проблема #3, если первые пункты не помогут)

---

## 🚀 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

После исправления критических проблем:
- ✅ Исчезнут лаги при вводе текста
- ✅ Количество ре-рендеров сократится в 10-20 раз
- ✅ Производительность приложения станет плавной
- ✅ Задачи будут сохраняться локально при перезагрузке
- ✅ Можно будет переназначать задачи на других исполнителей

---

## 📝 ДОПОЛНИТЕЛЬНЫЕ ЗАМЕЧАНИЯ

### Позитивные стороны кода:
- ✅ Хорошая структура папок
- ✅ Использование TypeScript
- ✅ Разделение на компоненты
- ✅ Использование Material-UI
- ✅ Оптимистичные обновления UI

### Что можно добавить в будущем:
- React Query для кеширования и синхронизации с сервером
- Drag & Drop для перемещения задач между колонками
- Виртуализация списков (react-window) для больших данных
- End-to-end тесты с Playwright/Cypress

---

## 🔧 ГОТОВЫЙ ПЛАН РЕФАКТОРИНГА

### Этап 1: Исправление производительности (1-2 часа)
```tsx
// 1. Обернуть компоненты в memo
export default memo(Task);
export default memo(TaskList);

// 2. Исправить все useCallback на функциональные обновления
const moveTaskToColumn = useCallback(async (...) => {
  setTodos(current => /* ... */);
}, []); // пустые зависимости!

// 3. Удалить дубль setTodos в updateTaskTitle
```

### Этап 2: Критическая функциональность (1 час)
```tsx
// 1. Добавить localStorage для задач
const [todos, setTodos] = useState<Todo[]>(() => {
  const saved = localStorage.getItem('todos');
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  localStorage.setItem('todos', JSON.stringify(todos));
}, [todos]);

// 2. Добавить изменение исполнителя
const updateTaskAssignee = useCallback(async (taskId: string, newUserId: number) => {
  setTodos(current => current.map(t =>
    t.id === taskId ? {...t, userId: newUserId} : t
  ));
  await updateTodo(taskId, { userId: newUserId });
}, []);
```

### Этап 3: Чистка кода (30 минут)
```bash
# Удалить:
- Закомментированный код (строки 105-125, 176-186)
- console.log
- Неиспользуемые импорты (Opacity)
- Неиспользуемые переменные (color, setColor)

# Исправить:
- Опечатку "Добавиь" → "Добавить"
- Типы ID: number → string
```

### Этап 4: Рефакторинг архитектуры (2-4 часа)
```tsx
// Вынести логику в hooks:
hooks/useTasksManager.ts
hooks/useColumnsManager.ts
hooks/useUsers.ts

// Разбить UI:
components/TaskCreator.tsx
components/ColumnCreator.tsx
```

---

**Итого:** Критические проблемы можно исправить за 1-2 часа работы, что даст огромный прирост производительности!
