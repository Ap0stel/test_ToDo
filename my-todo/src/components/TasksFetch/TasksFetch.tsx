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

const DEFAULT_COLUMNS: Column[] = [
  { id: "completed", title: "В работе", order: 0 },
  { id: "progress", title: "Завершено", order: 1 },
];

export default function TasksFetch() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);

  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);

  const [newTaskColumnId, setNewTaskColumnId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState<"red" | "green">("green");

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");

  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [newTaskUserId, setNewTaskUserId] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    Promise.all([fetchTodos(), fetchUsers()])
      .then(([apiTodos, usersData]) => {
        const appTodos: Todo[] = apiTodos.map((apiTodo) => ({
          ...apiTodo,
          id: String(apiTodo.id),
          columnId: apiTodo.completed ? "completed" : "progress",
          // Теперь у нас есть columnId, а completed можем игнорировать
        }));

        setUsers(usersData);
        setTodos(appTodos);
      })
      .catch(() => setError("Ошибка в получении контента"))
      .finally(() => setIsLoadingTasks(false));
  }, []);

  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, Todo[]> = {};

    //  { id: 1, title: "В работе", isCompleted: false },
    // Инициализируем пустые массивы для каждой колонки
    columns.forEach((column) => {
      grouped[column.id] = [];
    });

    // Один проход по всем задачам, распределяем по колонкам
    todos.forEach((task) => {
      if (grouped[task.columnId]) {
        grouped[task.columnId].push(task);
      }
    });

    return grouped;
  }, [todos, columns]);

  // коллбеки нужно передавать в дочерние компоненты, используя useCallback. в таком случае
  // ссылка на функцию не будет меняться на каждом рендере
  // иначе React будет считать, что проп toggleTask изменился, и это вызовет лишние перерисовки / эффекты / пересоздание подписок.

  // const toggleTask = useCallback(
  //   async (taskId: number) => {
  //     setColor(color === "red" ? "green" : "red");

  //     const task = todos.find((t) => t.id === taskId);
  //     if (!task) return;

  //     try {
  //       const updatedTodos = todos.map((t) =>
  //         t.id === taskId ? { ...t, completed: !t.completed } : t,
  //       );
  //       setTodos(updatedTodos);

  //       await updateTodo(taskId, { completed: !task.completed });
  //     } catch (error) {
  //       console.error("Error", error);
  //       setError("Error");
  //     }
  //   },
  //   [color, todos],
  // );

  const moveTaskToColumn = useCallback(async (taskId: string, targetColumnId: string) => {
    const task = todos.find(t => t.id === taskId);
    if (!task) return;

    try {
      const updatedTodos = todos.map(t => 
        t.id === taskId ? {...t, columnId: targetColumnId } : t   
      );
      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error moving task:', error);
    }
  }, [todos]);

  const toggleTask = useCallback((taskId: string) => {
    const task = todos.find(t => t.id === taskId);
    if (!task) return;

    const targetColumnId = task.columnId === 'completed'
      ? 'progress'
      : 'completed';
    moveTaskToColumn(taskId, targetColumnId);
  }, [todos, columns, moveTaskToColumn]);


  const updateTaskTitle = useCallback(
    async (taskId: number, newTitle: string) => {
      if (newTitle.trim() === "") {
        return;
      }

      try {
        const updTodos = todos.map((task) =>
          task.id === taskId ? { ...task, title: newTitle.trim() } : task,
        );
        setTodos(updTodos);

        await updateTodo(taskId, { title: newTitle.trim() });

        setTodos(updTodos);
      } catch (error) {
        console.error("Error updating task title:", error);
        setError("Ошибка при редактировании задачи");
      }
    },
    [todos],
  );

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      setDeletingTaskId(taskId);
      // Отправляем DELETE запрос на сервер
      await deleteTodo(taskId);

      // Удаляем из локального state
      setTodos((actualTodos) =>
        actualTodos.filter((task) => task.id !== taskId),
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

    const column = columns.find((c) => c.id === newTaskColumnId);
    if (!column) return;

    try {
      const serverTask = await createTodo(
        newTaskTitle.trim(),
        column.isCompleted,
        newTaskUserId,
      );

      const appTask: Todo = {
        ...serverTask,
        columnId: column.id,
      };

      setTodos((actualTodos) => [appTask, ...actualTodos]);
      setNewTaskTitle("");
      setnewTaskUserId(undefined);
      setNewTaskColumnId(null);
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating task;", error);
      setError("Error");
    }
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
              {columns.map((col) => (
                <MenuItem key={col.id} value={col.id}>
                  {col.title}
                </MenuItem>
              ))}
            </Select>

            <Select
              size="small"
              value={newTaskUserId}
              onChange={(e) => setNewTaskUserId(Number(e.target.value))}
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

      <Stack direction="row" spacing={2}>
        {columns
          .sort((a, b) => a.order - b.order)
          .map((column) => (
            <TaskList
              key={column.id}
              title={column.title}
              tasks={tasksByColumn[column.id] || []}
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
