/* eslint-disable jsx-a11y/no-autofocus */
import { useCallback, useEffect, useMemo, useState } from "react";
import TaskList from "../TaskList/TaskList";
import classes from "./TasksFetch.module.css";
import { Todo } from "../../types";
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../../api/todos";
import { Box, Button, Stack } from "@mui/material";
export default function TasksFetch() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState<"red" | "green">("green");

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");

  const [newTaskCompleted, setNewTaskCompleted] = useState<boolean>(false);

  useEffect(() => {
    fetchTodos()
      .then((toDos) => {
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
    async (taskId: number) => {
      setColor(color === "red" ? "green" : "red");

      const task = todos.find((t) => t.id === taskId);
      if (!task) return;

      try {
        const updatedTodos = todos.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        setTodos(updatedTodos);

        await updateTodo(taskId, { completed: !task.completed });
      } catch (error) {
        console.error("Error", error);
        setError("Error");
      }
    },
    [color, todos]
  );

  const updateTaskTitle = useCallback(
    async (taskId: number, newTitle: string) => {
      if (newTitle.trim() === "") {
        return;
      }

      try {
        const updTodos = todos.map((task) =>
          task.id === taskId ? { ...task, title: newTitle.trim() } : task
        );
        setTodos(updTodos);

        await updateTodo(taskId, { title: newTitle.trim() });

        setTodos(updTodos);
      } catch (error) {
        console.error("Error updating task title:", error);
        setError("Ошибка при редактировании задачи");
      }
    },
    [todos]
  );

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      // Отправляем DELETE запрос на сервер
      await deleteTodo(taskId);

      // Удаляем из локального state
      setTodos((actualTodos) =>
        actualTodos.filter((task) => task.id !== taskId)
      );
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Ошибка при удалении задачи");
    }
  }, []);

  const createTask = async () => {
    if (newTaskTitle.trim() === "") return;
    try {
      const serverTask = await createTodo(
        newTaskTitle.trim(),
        newTaskCompleted
      );

      const newTask: Todo = {
        ...serverTask, 
        completed:newTaskCompleted,
      };
        
      setTodos((actualTodos) => [newTask, ...actualTodos]);
      setNewTaskTitle("");
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating task;", error);
      setError("Error");
    }
  };
  const handleCreateKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      await createTask();
    }
  };

  if (isLoadingTasks)
    return <p className={classes["loading-message"]}>Загрузка контента...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className={classes["create-task"]}>
        {isCreating ? (
          <div>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleCreateKeyDown}
              placeholder="Введите задачу и нажмите Enter"
              autoFocus
            />

            <select
              value={String(newTaskCompleted)}
              onChange={(e) => setNewTaskCompleted(e.target.value === "true")}
            >
              <option value="false">Активная</option>
              <option value="true">Завершена</option>
            </select>
          </div>
        ) : (
          <>
            <Button variant="text" sx={{ color }}>
              Text
            </Button>
            <Button variant="contained" size="small" sx={{ color }}>
              Contained
            </Button>
            <Button variant="outlined" size="small" sx={{ color }}>
              Outlined
            </Button>

            <Button sx={{ color }} color="secondary">
              Secondary
            </Button>
            <Button
              sx={{ color }}
              variant="contained"
              size="large"
              color="success"
            >
              Success
            </Button>
            <Button
              sx={{ color }}
              variant="outlined"
              size="large"
              color="error"
            >
              Error
            </Button>

            <Button sx={{ color }} onClick={() => setIsCreating(true)}>
              + Добавить задачу
            </Button>
          </>
        )}
      </div>
      <Box sx={{ border: "3px solid red", width: 100, height: 100 }}>
        my box
      </Box>

      <Stack
        sx={{ border: "3px solid red", width: 300, height: 300 }}
        spacing={4}
      >
        <Box sx={{ border: "3px solid red", width: 100, height: 100 }}>
          my box 1
        </Box>
        <Box sx={{ border: "3px solid red", width: 100, height: 100 }}>
          my box 2
        </Box>
        <Box sx={{ border: "3px solid red", width: 100, height: 100 }}>
          my box 3
        </Box>
      </Stack>

      <Stack direction="row">
        <TaskList
          title="Активные"
          tasks={activeTasks}
          onToggle={toggleTask}
          onUpdateTitle={updateTaskTitle}
          onDelete={deleteTask}
        />
        <TaskList
          title="Завершенные"
          tasks={completedTasks}
          onToggle={toggleTask}
          onUpdateTitle={updateTaskTitle}
          onDelete={deleteTask}
        />
      </Stack>
    </>
  );
}
