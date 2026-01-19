import { Column } from "../types";

const BASE_URL = "https://jsonplaceholder.typicode.com";

export const fetchColumns = async (): Promise<Column[]> => {
  const response = await fetch(`${BASE_URL}/columns`);

  if (!response.ok) {
    throw new Error("Ошибка получения колонок");
  }

  return response.json();
};
