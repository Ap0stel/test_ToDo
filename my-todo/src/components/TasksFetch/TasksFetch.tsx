/* eslint-disable jsx-a11y/no-autofocus */
import { useCallback, useEffect, useMemo, useState } from "react";
import TaskList from "../TaskList/TaskList";
import { Todo } from "../../types";
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../../api/todos";
import { Alert, Box, Button, CircularProgress, MenuItem, Select, Stack, TextField } from "@mui/material";
import { User } from "../../types/index";
import { fetchUsers } from "../../api/users";

export default function TasksFetch() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState<"red" | "green">("green");

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");

  const [newTaskCompleted, setNewTaskCompleted] = useState<string>('progress');

  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [newTaskUserId, setnewTaskUserId] = useState<number | undefined> (undefined);

useEffect(() => {
  Promise.all([fetchTodos(), fetchUsers()])
    .then(([todosData, usersData]) => {
      const usersMap = new Map(
        usersData.map((u) => [u.id, u])
      );

      const newTodos = todosData.slice(0, 20).map((todo) => ({
        ...todo,
        user: usersMap.get(todo.userId),
      }));

      setUsers(usersData);
      setTodos(newTodos);
    })
    .catch(() => setError("Ошибка в получении контента"))
    .finally(() => setIsLoadingTasks(false));
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
    if (newTaskTitle.trim() === "") return;
    try {
      if (newTaskUserId) {
        const serverTask = await createTodo(
          newTaskTitle.trim(),
          newTaskCompleted === 'completed',
          newTaskUserId,
      );
      // const newTask: Todo = {
      //   ...serverTask, 
      //   completed:newTaskCompleted,
      // };
        setTodos((actualTodos) => [serverTask, ...actualTodos]);
        setNewTaskTitle("");
        setIsCreating(false);
      }
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

  if (isLoadingTasks) {
    return (
      <Box display='flex' justifyContent='center' mt={4}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }
  console.log(newTaskUserId);
  console.log(activeTasks);
 
  return (
    <>
      <Box mb={3}>
        {isCreating ? (
          <Stack direction='row' spacing={2} alignItems='center'>
            <TextField
              label='Новая задача'
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              size="small"
              autoFocus
            />

            <Select 
              size="small"
              value={newTaskCompleted}
              onChange={(e) => setNewTaskCompleted(e.target.value)}
            >
              <MenuItem value='progress'>Активная</MenuItem>
              <MenuItem value='completed'>Завершённая</MenuItem>
            </Select>

            <Select 
              size="small"
              value={newTaskUserId}
              onChange={(e) => setnewTaskUserId(Number(e.target.value))}
              displayEmpty
            >
              <MenuItem sx={{display:'none'}} value={undefined}>Выберите пользователя</MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
              ))}
            </Select>

            <Button variant='contained' onClick={createTask}>
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
          <Button
            variant="contained"
            onClick={() => setIsCreating(true)}
          >
            + Добавить задачу
          </Button>
        )}
      </Box>

      <Stack direction="row">
        <TaskList
          title="Активные"
          tasks={activeTasks}
          onToggle={toggleTask}
          onUpdateTitle={updateTaskTitle}
          onDelete={deleteTask}
          deletingTaskId={deletingTaskId}
        />
        <TaskList
          title="Завершенные"
          tasks={completedTasks}
          onToggle={toggleTask}
          onUpdateTitle={updateTaskTitle}
          onDelete={deleteTask}
          deletingTaskId={deletingTaskId}
        />
      </Stack>
    </>
  );
}
