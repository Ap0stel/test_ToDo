# Утилиты для работы с колонками

## Обзор

Этот модуль содержит утилиты для преобразования названий колонок в программные идентификаторы (ID).

## Основные функции

### `generateColumnId(title: string): string`

Преобразует название колонки в ID (slug).

**Что делает:**
1. Переводит в нижний регистр
2. Транслитерирует кириллицу в латиницу
3. Заменяет пробелы на дефисы
4. Удаляет специальные символы

**Примеры:**
```typescript
generateColumnId("На проверке")  // → "na-proverke"
generateColumnId("В работе")     // → "v-rabote"
generateColumnId("Завершено")    // → "zaversheno"
generateColumnId("To Do")        // → "to-do"
```

### `isColumnIdUnique(id: string, existingIds: string[]): boolean`

Проверяет, является ли ID уникальным.

**Примеры:**
```typescript
const existingIds = ["progress", "review", "completed"];

isColumnIdUnique("progress", existingIds)  // → false
isColumnIdUnique("blocked", existingIds)   // → true
```

### `generateUniqueColumnId(title: string, existingIds: string[]): string`

Генерирует уникальный ID, добавляя суффикс при необходимости.

**Примеры:**
```typescript
const existingIds = ["zadachi"];

generateUniqueColumnId("Задачи", existingIds)      // → "zadachi-2"
generateUniqueColumnId("Новая задача", existingIds) // → "novaya-zadacha"
```

## Использование в компоненте

```typescript
import { generateUniqueColumnId } from "../../utils/columnUtils";
import { Column } from "../../types";

const addNewColumn = (title: string) => {
  // Получаем существующие ID колонок
  const existingIds = columns.map(col => col.id);

  // Генерируем уникальный ID
  const id = generateUniqueColumnId(title, existingIds);

  // Создаем новую колонку
  const newColumn: Column = {
    id,
    title,
    isCompleted: false
  };

  setColumns([...columns, newColumn]);
};

// Использование
addNewColumn("На проверке");  // Создаст колонку с id: "na-proverke"
```

## Транслитерация

Функция поддерживает транслитерацию русских букв:

| Русская | Латинская |
|---------|-----------|
| а       | a         |
| б       | b         |
| в       | v         |
| г       | g         |
| д       | d         |
| е       | e         |
| ё       | yo        |
| ж       | zh        |
| з       | z         |
| и       | i         |
| й       | y         |
| к       | k         |
| л       | l         |
| м       | m         |
| н       | n         |
| о       | o         |
| п       | p         |
| р       | r         |
| с       | s         |
| т       | t         |
| у       | u         |
| ф       | f         |
| х       | h         |
| ц       | ts        |
| ч       | ch        |
| ш       | sh        |
| щ       | sch       |
| ы       | y         |
| э       | e         |
| ю       | yu        |
| я       | ya        |

## Преимущества этого подхода

1. **Читаемость** - ID понятны: `"na-proverke"` лучше чем `"col-123"`
2. **URL-safe** - можно использовать в адресах
3. **Уникальность** - автоматическое добавление суффиксов при конфликтах
4. **Простота** - не требует внешних библиотек
5. **Отладка** - легко понять, какая колонка по ID

## Альтернативные подходы

### UUID (если нужна 100% уникальность)
```typescript
import { v4 as uuid } from 'uuid';
const id = uuid();  // "550e8400-e29b-41d4-a716-446655440000"
```

### Числовые ID (если нужна простота)
```typescript
const id = columns.length + 1;  // 1, 2, 3...
```

Текущий подход (slug + транслитерация) - это баланс между читаемостью и надежностью.
