/**
 * ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ функций для генерации ID колонок
 *
 * Этот файл содержит примеры того, как использовать утилиты из columnUtils.ts
 */

import {
  generateColumnId,
  generateUniqueColumnId,
  isColumnIdUnique,
} from "./columnUtils";

// ============================================================================
// ПРИМЕР 1: Простая генерация ID
// ============================================================================

console.log("=== ПРИМЕР 1: Простая генерация ID ===");

// Русские названия
console.log(generateColumnId("На проверке")); // → "na-proverke"
console.log(generateColumnId("В работе")); // → "v-rabote"
console.log(generateColumnId("Завершено")); // → "zaversheno"
console.log(generateColumnId("Новые задачи")); // → "novye-zadachi"

// Английские названия
console.log(generateColumnId("To Do")); // → "to-do"
console.log(generateColumnId("In Progress")); // → "in-progress"
console.log(generateColumnId("Done")); // → "done"

// Смешанные и со спецсимволами
console.log(generateColumnId("Bug's & Fix!!")); // → "bugs-fix"
console.log(generateColumnId("  Много   пробелов  ")); // → "mnogo-probelov"

// ============================================================================
// ПРИМЕР 2: Проверка уникальности
// ============================================================================

console.log("\n=== ПРИМЕР 2: Проверка уникальности ===");

const existingIds = ["progress", "review", "completed"];

console.log(isColumnIdUnique("progress", existingIds)); // → false (уже есть)
console.log(isColumnIdUnique("blocked", existingIds)); // → true (нет такого)

// ============================================================================
// ПРИМЕР 3: Генерация уникального ID с суффиксом
// ============================================================================

console.log("\n=== ПРИМЕР 3: Генерация уникального ID ===");

// Если ID свободен - возвращается как есть
console.log(generateUniqueColumnId("Архив", existingIds)); // → "arhiv"

// Если ID занят - добавляется суффикс
const existingIds2 = ["zadachi", "zadachi-2"];
console.log(generateUniqueColumnId("Задачи", existingIds2)); // → "zadachi-3"

// ============================================================================
// ПРИМЕР 4: Использование в React компоненте
// ============================================================================

console.log("\n=== ПРИМЕР 4: Использование в React компоненте ===");

/*
// В вашем компоненте TasksFetch.tsx:

import { generateUniqueColumnId } from "../../utils/columnUtils";

const addNewColumn = useCallback((title: string) => {
  // Получаем существующие ID
  const existingIds = columns.map(col => col.id);

  // Генерируем уникальный ID
  const id = generateUniqueColumnId(title, existingIds);

  const newColumn: Column = {
    id: parseInt(id), // или просто id если Column.id это string
    title,
    isCompleted: false
  };

  setColumns([...columns, newColumn]);
}, [columns]);

// Использование:
addNewColumn("На проверке");  // Создаст колонку с id: "na-proverke"
*/

// ============================================================================
// ПРИМЕР 5: Массовое создание колонок
// ============================================================================

console.log("\n=== ПРИМЕР 5: Массовое создание колонок ===");

const columnTitles = [
  "Новые задачи",
  "В работе",
  "На проверке",
  "Тестирование",
  "Завершено",
  "Архив",
];

const generatedColumns = columnTitles.map((title, index) => ({
  id: generateColumnId(title),
  title: title,
  order: index,
}));

console.log(generatedColumns);
/*
Результат:
[
  { id: "novye-zadachi", title: "Новые задачи", order: 0 },
  { id: "v-rabote", title: "В работе", order: 1 },
  { id: "na-proverke", title: "На проверке", order: 2 },
  { id: "testirovanie", title: "Тестирование", order: 3 },
  { id: "zaversheno", title: "Завершено", order: 4 },
  { id: "arhiv", title: "Архив", order: 5 }
]
*/

// ============================================================================
// ПРИМЕР 6: Обработка ошибок и валидация
// ============================================================================

console.log("\n=== ПРИМЕР 6: Обработка ошибок ===");

/*
// В форме создания колонки:

const handleAddColumn = (title: string) => {
  // Проверяем, что название не пустое
  if (!title.trim()) {
    setError("Название колонки не может быть пустым");
    return;
  }

  const existingIds = columns.map(col => col.id);
  const newId = generateColumnId(title);

  // Проверяем уникальность (опционально, если не хотите суффиксы)
  if (!isColumnIdUnique(newId, existingIds)) {
    setError(`Колонка "${title}" уже существует`);
    return;
  }

  // Или используйте generateUniqueColumnId для автоматического добавления суффикса
  const uniqueId = generateUniqueColumnId(title, existingIds);

  const newColumn: Column = {
    id: uniqueId,
    title,
    order: columns.length
  };

  setColumns([...columns, newColumn]);
  setError(null);
};
*/
