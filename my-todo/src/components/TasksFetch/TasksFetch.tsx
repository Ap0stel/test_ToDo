/* eslint-disable jsx-a11y/no-autofocus */
import { useCallback, useEffect, useMemo, useState } from "react";
import TaskList from "../TaskList/TaskList";
import { Todo, Column } from "../../types";
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../../api/todos";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { User } from "../../types/index";
import { fetchUsers } from "../../api/users";
import { fetchColumns } from "../../api/columns";

export default function TasksFetch() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
  
  const [columns, setColumns] = useState<Column[]>([]);

  const [newTaskColumnId, setNewTaskColumnId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState<"red" | "green">("green");


  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");

  const [newTaskCompleted, setNewTaskCompleted] = useState<string>("progress");

  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [newTaskUserId, setnewTaskUserId] = useState<number | undefined>(
    undefined
  );

useEffect(() => {
  Promise.all([fetchTodos(), fetchUsers(), fetchColumns()])
    .then(([apiTodos, usersData, columnsData]) => {
      const appTodos = apiTodos.map(apiTodo => {
        const column = columnsData.find(c => 
          c.isCompleted === apiTodo.completed
        );
        return {
          ...apiTodo,
          columnId: column?.id,
        };
      });
      setColumns(columnsData);
      setUsers(usersData);
      setTodos(appTodos);
    })
    .catch(() => setError("Ошибка в получении контента"))
    .finally(() => setIsLoadingTasks(false));
}, []);

useEffect(() => {
  if (columns.length && newTaskColumnId === null) {
    setNewTaskColumnId(columns[0].id);
  }
}, [columns]);

  const activeTasks = useMemo(
    () => todos.filter((task) => task.columnId === 'progress'),
    [todos]
  );

  const completedTasks = useMemo(
    () => todos.filter((task) => task.columnId === 'progress'),
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
      setDeletingTaskId(taskId);
      // Отправляем DELETE запрос на сервер
      await deleteTodo(taskId);

      // Удаляем из локального state
      setTodos((actualTodos) =>
        actualTodos.filter((task) => task.id !== taskId)
      );
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Ошибка при удалении задачи");
    } finally {
      setDeletingTaskId(null);
    }
  }, []);

  const createTask = async () => {
    if (!newTaskTitle.trim()) return;
    if (!newTaskUserId) return;
    if (newTaskColumnId === null) return;

    const column = columns.find(c => c.id === newTaskColumnId);
    if (!column) return;

    try {
      const serverTask = await createTodo(
        newTaskTitle.trim(),
        column.isCompleted,
        newTaskUserId
        );

        const appTask = {
          ...serverTask,
          columnId: column.id,
        } as Todo

        setTodos((actualTodos) => [appTask, ...actualTodos]);
        setNewTaskTitle("");
        setIsCreating(false);
    }
      catch (error) {
      console.error("Error creating task;", error);
      setError("Error");
    };

  if (isLoadingTasks) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  console.log(newTaskUserId);
  console.log(activeTasks);

  return (
    <>
      <Box mb={3}>
        {isCreating ? (
          <Stack direction="row" spacing={3} alignItems="flex-start">
            <TextField
              label="Новая задача"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              size="small"
              autoFocus
            />

            <Select
              size="small"
              value={newTaskColumnId}
              onChange={(e) => setNewTaskColumnId(e.target.value)}
            >
              {columns.map(col => (
                <MenuItem key={col.id} value={col.id}>
                  {col.title}
                </MenuItem>
              ))}
            </Select>

            <Select
              size="small"
              value={newTaskUserId}
              onChange={(e) => setnewTaskUserId(Number(e.target.value))}
              displayEmpty
            >
              <MenuItem sx={{ display: "none" }} value={undefined}>
                Выберите пользователя
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>

            <Button variant="contained" onClick={createTask}>
              Создать
            </Button>

            <Button
              variant="text"
              color="inherit"
              onClick={() => setIsCreating(false)}
            >
              Отмена
            </Button>
          </Stack>
        ) : (
          <Button variant="contained" onClick={() => setIsCreating(true)}>
            + Добавить задачу
          </Button>
        )}
      </Box>

      <Stack direction="row">
        {columns.map(column => (
          <TaskList
            key={column.id}
            title={column.title}
            tasks={todos.filter(t => t.columnId === column.id)}
            users={users}
            onToggle={toggleTask}
            onUpdateTitle={updateTaskTitle}
            onDelete={deleteTask}
            deletingTaskId={deletingTaskId}
          />
        ))}
      </Stack>
    </>
  );
}
