/**
 * Карта транслитерации кириллицы в латиницу
 */
const translitMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

/**
 * Преобразует рукописный текст в ID для колонки
 *
 * Примеры:
 * - "На проверке" → "na-proverke"
 * - "В работе" → "v-rabote"
 * - "Завершено" → "zaversheno"
 * - "Hello World" → "hello-world"
 *
 * @param title - Название колонки
 * @returns ID колонки (slug)
 */
export const generateColumnId = (title: string): string => {
  return title
    .toLowerCase() // Преобразуем в нижний регистр
    .split("") // Разбиваем на символы
    .map((char) => translitMap[char] || char) // Транслитерируем кириллицу
    .join("") // Собираем обратно
    .replace(/\s+/g, "-") // Заменяем пробелы на дефисы
    .replace(/[^\w\-]/g, "") // Убираем все, кроме букв, цифр и дефисов
    .replace(/\-+/g, "-") // Убираем множественные дефисы
    .replace(/^\-|\-$/g, ""); // Убираем дефисы в начале и конце
};

/**
 * Проверяет уникальность ID колонки
 *
 * @param id - ID для проверки
 * @param existingIds - Массив существующих ID
 * @returns true если ID уникален, false если уже существует
 */
export const isColumnIdUnique = (
  id: string,
  existingIds: string[]
): boolean => {
  return !existingIds.includes(id);
};

/**
 * Генерирует уникальный ID колонки, добавляя суффикс если необходимо
 *
 * Примеры:
 * - "задачи" → "zadachi" (если уникален)
 * - "задачи" → "zadachi-2" (если "zadachi" уже существует)
 * - "задачи" → "zadachi-3" (если "zadachi" и "zadachi-2" уже существуют)
 *
 * @param title - Название колонки
 * @param existingIds - Массив существующих ID
 * @returns Уникальный ID колонки
 */
export const generateUniqueColumnId = (
  title: string,
  existingIds: string[]
): string => {
  const baseId = generateColumnId(title);

  // Если базовый ID уникален, возвращаем его
  if (isColumnIdUnique(baseId, existingIds)) {
    return baseId;
  }

  // Если не уникален, добавляем суффикс с числом
  let counter = 2;
  let uniqueId = `${baseId}-${counter}`;

  while (!isColumnIdUnique(uniqueId, existingIds)) {
    counter++;
    uniqueId = `${baseId}-${counter}`;
  }

  return uniqueId;
};
