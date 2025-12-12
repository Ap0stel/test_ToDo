import { useCallback, useEffect, useMemo, useState } from "react";
import TaskList from "../TaskList/TaskList";
import classes from "./TasksFetch.module.css";
import { Todo } from "../../types";

export default function TasksFetch() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/todos")
      .then((result) => result.json())
      .then((toDos: Todo[]) => {
        setTodos(toDos.slice(0, 20));
        setIsLoadingTasks(false);
      })
      .catch(() => {
        setError("Ошибка в получении контента");
        setIsLoadingTasks(false);
      });
  }, []);

  const activeTasks = useMemo(
    () => todos.filter((task) => !task.completed),

    [todos]
  );

  const completedTasks = useMemo(
    () => todos.filter((task) => task.completed),
    [todos]
  );

  // коллбеки нужно передавать в дочерние компоненты, используя useCallback. в таком случае
  // ссылка на функцию не будет меняться на каждом рендере
  // иначе React будет считать, что проп toggleTask изменился, и это вызовет лишние перерисовки / эффекты / пересоздание подписок.

  const toggleTask = useCallback(
    (taskId: number) => {
      const updatedTodos = todos.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );

      setTodos(updatedTodos);
    },
    [todos]
  );

  if (isLoadingTasks)
    return <p className={classes["loading-message"]}>Загрузка контента...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <TaskList title="Активные" tasks={activeTasks} onToggle={toggleTask} />
      <TaskList
        title="Завершенные"
        tasks={completedTasks}
        onToggle={toggleTask}
      />
    </>
  );
}
