/* eslint-disable jsx-a11y/no-autofocus */
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useDeferredValue,
} from "react";
import TaskList from "../TaskList/TaskList";
import { Todo, Column } from "../../types";
import { CreateTaskForm } from "../CreateTaskForm/CreateTaskForm";
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
  { id: "progress", title: "В работе", order: 0 },
  { id: "completed", title: "Завершено", order: 1 },
];

export default function TasksFetch() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);

  // const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [columns, setColumns] = useState<Column[]>(() => {
    const saved = localStorage.getItem("columns");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_COLUMNS;
      }
    }
    return DEFAULT_COLUMNS;
  });

  // const [newTaskColumnId, setNewTaskColumnId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState<"red" | "green">("green");

  const [isCreating, setIsCreating] = useState<boolean>(false);
  // const [newTaskTitle, setNewTaskTitle] = useState<string>("");

  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  // const [newTaskUserId, setNewTaskUserId] = useState<number | "">("");

  const [isCreatingColumn, setIsCreatingColumn] = useState<boolean>(false);
  const [newColumnTitle, setNewColumnTitle] = useState<string>("");

  const COMPLETED_COLUMN_ID = "completed";

  useEffect(() => {
    Promise.all([fetchTodos(), fetchUsers()])
      .then(([apiTodos, usersData]) => {
        const appTodos: Todo[] = apiTodos.map((apiTodo) => ({
          ...apiTodo,
          id: String(apiTodo.id),
          columnId: apiTodo.completed ? COMPLETED_COLUMN_ID : "progress",
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

  const moveTaskToColumn = useCallback(
    async (taskId: string, targetColumnId: string) => {
      setTodos((currentTodos) => {
        const task = currentTodos.find((t) => t.id === taskId);
        if (!task) return currentTodos;

        return currentTodos.map((t) =>
          t.id === taskId ? { ...t, columnId: targetColumnId } : t,
        );
      });
    },
    [],
  );

  const toggleTask = useCallback((taskId: string) => {
    setTodos((currentTodos) => {
      const task = currentTodos.find((t) => t.id === taskId);
      if (!task) return currentTodos;

      const targetColumnId =
        task.columnId === COMPLETED_COLUMN_ID
          ? "progress"
          : COMPLETED_COLUMN_ID;

      return currentTodos.map((t) =>
        t.id === taskId ? { ...t, columnId: targetColumnId } : t,
      );
    });
  }, []);
  // const toggleTask = useCallback((taskId: string) => {
  //   const task = todos.find(t => t.id === taskId);
  //   if (!task) return;

  //   const targetColumnId = task.columnId === COMPLETED_COLUMN_ID
  //     ? 'progress'
  //     : COMPLETED_COLUMN_ID;
  //   moveTaskToColumn(taskId, targetColumnId);
  // }, [todos, moveTaskToColumn]);

  const generateColumnId = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]/g, "");
  };

  const addNewColumn = useCallback(
    (title: string) => {
      const id = generateColumnId(title);

      if (columns.some((col) => col.id === id)) {
        setError("Колонка с таким названием уже есть");
        return;
      }

      const newColumn: Column = {
        id,
        title,
        order: columns.length,
      };

      setColumns([...columns, newColumn]);
    },
    [columns],
  );

  // const [columns, setColumns] = useSate<Column[]>(() => {
  //   const saved = localStorage.getItem('columns');
  //   if (saved) {
  //     try {
  //       return JSON.parse(saved);
  //     } catch {
  //       return DEFAULT_COLUMNS;
  //     }
  //   }
  //   return DEFAULT_COLUMNS;
  // });
  useEffect(() => {
    localStorage.setItem("columns", JSON.stringify(columns));
  }, [columns]);

  const updateTaskTitle = useCallback(
    async (taskId: string, newTitle: string) => {
      const trimmed = newTitle.trim();
      if (!trimmed) return;

      let previousTitle: string | null = null;

      setTodos((currentTodos) =>
        currentTodos.map((task) => {
          if (task.id === taskId) {
            previousTitle = task.title;
            return { ...task, title: trimmed };
          }
          return task;
        }),
      );

      try {
        await updateTodo(taskId, { title: trimmed });
      } catch {
        if (previousTitle !== null) {
          setTodos((currentTodos) =>
            currentTodos.map((task) =>
              task.id === taskId ? { ...task, title: previousTitle! } : task,
            ),
          );
        }
      }
    },
    [],
  );

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      setDeletingTaskId(taskId);
      // Отправляем DELETE запрос на сервер
      await deleteTodo(Number(taskId));

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

  const handleCreateTask = async (
    title: string,
    userId: number,
    columnId: string,
  ) => {
    try {
      const serverTask = await createTodo(title, userId);

      const appTask: Todo = {
        ...serverTask,
        id: String(serverTask.id),
        columnId,
      };

      setTodos((prevTodos) => [appTask, ...prevTodos]);
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Ошибка при создании задачи");
    }
  };

  // const createTask = async () => {
  //   if (!newTaskTitle.trim()) return;
  //   if (newTaskUserId === "") return;
  //   if (!newTaskColumnId) return;

  //   const column = columns.find((c) => c.id === newTaskColumnId);
  //   if (!column) return;

  //   try {
  //     const serverTask = await createTodo(
  //       newTaskTitle.trim(),
  //       newTaskUserId,
  //     );

  //     const appTask: Todo = {
  //       ...serverTask,
  //       columnId: column.id,
  //     };

  //     setTodos((actualTodos) => [appTask, ...actualTodos]);
  //     setNewTaskTitle("");
  //     setNewTaskUserId("");
  //     setNewTaskColumnId("");
  //     setIsCreating(false);
  //   } catch (error) {
  //     console.error("Error creating task;", error);
  //     setError("Error");
  //   }
  // };

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
        {isCreatingColumn ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              label="Название колонки"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              autoFocus
            />

            <Button
              variant="contained"
              onClick={() => {
                if (!newColumnTitle.trim()) return;
                addNewColumn(newColumnTitle.trim());
                setNewColumnTitle("");
                setIsCreatingColumn(false);
              }}
            >
              Создать колонку
            </Button>

            <Button variant="text" onClick={() => setIsCreatingColumn(false)}>
              Отмена
            </Button>
          </Stack>
        ) : (
          <Button variant="contained" onClick={() => setIsCreatingColumn(true)}>
            +Добавиь колонку
          </Button>
        )}
      </Box>

      <Box mb={3}>
        {isCreating ? (
          <CreateTaskForm
            columns={columns}
            users={users}
            onCreate={(title, userId, columnId) => {
              handleCreateTask(title, userId, columnId);
              setIsCreating(false);
            }}
          />
        ) : (
          <Button variant="contained" onClick={() => setIsCreating(true)}>
            + Добавить задачу
          </Button>
        )}
      </Box>

      <Stack direction="row" spacing={2}>
        {columns.map((column) => (
          <TaskList
            key={column.id}
            title={column.title}
            tasks={tasksByColumn[column.id]}
            users={users}
            onToggle={toggleTask}
            onUpdateTitle={updateTaskTitle}
            onDelete={deleteTask}
            deletingTaskId={deletingTaskId}
          />
        ))}
      </Stack>
    </>
    //   <>
    //     <Box mb={3}>
    //       {isCreating ? (
    //         <Stack direction="row" spacing={3} alignItems="flex-start">
    //           <TextField
    //             label="Новая задача"
    //             value={newTaskTitle}
    //             onChange={(e) => setNewTaskTitle(e.target.value)}
    //             size="small"
    //             autoFocus
    //           />

    //           <Select
    //             size="small"
    //             value={newTaskColumnId}
    //             onChange={(e) => setNewTaskColumnId(e.target.value)}
    //             displayEmpty
    //             renderValue={(selected) => {
    //               if (!selected) {
    //                 return <em>Выберите колонку</em>;
    //               }

    //               const column = columns.find(col => col.id === selected);
    //               return column?.title;
    //             }}
    //           >
    //             <MenuItem sx={{ display: "none" }} value="">
    //               <em>Выберите колонку</em>
    //             </MenuItem>

    //             {columns.map((col) => (
    //               <MenuItem key={col.id} value={col.id}>
    //                 {col.title}
    //               </MenuItem>
    //             ))}
    //           </Select>

    //           <Select
    //             size="small"
    //             value={newTaskUserId}
    //             onChange={(e) => setNewTaskUserId(Number(e.target.value))}
    //             displayEmpty
    //           >
    //             <MenuItem sx={{ display: "none" }} value="">
    //               <em>Выберите пользователя</em>
    //             </MenuItem>
    //             {users.map((user) => (
    //               <MenuItem key={user.id} value={user.id}>
    //                 {user.name}
    //               </MenuItem>
    //             ))}
    //           </Select>

    //           <Button variant="contained" onClick={createTask} disabled={!newTaskTitle.trim() || !newTaskColumnId || !newTaskUserId}>
    //             Создать
    //           </Button>

    //           <Button
    //             variant="text"
    //             color="inherit"
    //             onClick={() => setIsCreating(false)}
    //           >
    //             Отмена
    //           </Button>
    //         </Stack>
    //       ) : (
    //         <Button variant="contained" onClick={() => setIsCreating(true)}>
    //           + Добавить задачу
    //         </Button>
    //       )}
    //     </Box>

    // <Box mb={3}>
    //   {isCreatingColumn ? (
    //     <Stack direction="row" spacing={2} alignItems="center">
    //       <TextField
    //         size="small"
    //         label="Название колонки"
    //         value={newColumnTitle}
    //         onChange={(e) => setNewColumnTitle(e.target.value)}
    //         autoFocus
    //       />

    //       <Button
    //         variant="contained"
    //         onClick={() => {
    //           if (!newColumnTitle.trim()) return;
    //           addNewColumn(newColumnTitle.trim());
    //           setNewColumnTitle('');
    //           setIsCreatingColumn(false);
    //       }}
    //       >
    //         Создать колонку
    //       </Button>

    //       <Button
    //         variant="text"
    //         onClick={() => setIsCreatingColumn(false)}
    //       >
    //         Отмена
    //       </Button>
    //     </Stack>
    //   ) : (
    //     <Button
    //       variant="contained"
    //       onClick={() => setIsCreatingColumn(true)}
    //     >
    //       +Добавиь колонку
    //     </Button>
    //   )}
    // </Box>

    //     <Stack direction="row" spacing={2}>
    //       {columns
    //         .sort((a, b) => a.order - b.order)
    //         .map((column) => (
    //           <TaskList
    //             key={column.id}
    //             title={column.title}
    //             tasks={tasksByColumn[column.id] || []}
    //             users={users}
    //             onToggle={toggleTask}
    //             onUpdateTitle={updateTaskTitle}
    //             onDelete={deleteTask}
    //             deletingTaskId={deletingTaskId}
    //           />
    //         ))}
    //     </Stack>
    //   </>
  );
}
