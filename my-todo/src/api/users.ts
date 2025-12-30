import { User } from "../types/index";

export const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  if (!res.ok) throw new Error("Ошибка загрузки пользователей");
  return res.json();
};
