import { useCallback, useEffect, useMemo, useState } from "react";
import TaskList from "../TaskList/TaskList";
import classes from "./TasksFetch.module.css";
import { Todo } from "../../types";

export default function TasksFetch() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");

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

  const updateTaskTitle = useCallback(
    (taskId: number, newTitle: string) => {
      if (newTitle.trim() === '') {
        return;
      }

      const updTodos = todos.map((task) => 
        task.id === taskId ? {...task, title: newTitle.trim() } : task
    );
    setTodos(updTodos);
    }, [todos]
  );

  const deleteTask = (taskId: number) => {
    setTodos(actualTodos =>
      actualTodos.filter(task => task.id != taskId)
    );
  };

  const createTask = () => {
    if (newTaskTitle.trim() === '') return;

    const newTask = {
      id: Date.now(),
      userId:1,
      title: newTaskTitle,
      completed: false,
    };

    setTodos(actualTodos => [newTask, ...actualTodos]);
    setNewTaskTitle('');
    setIsCreating(false);
  };

  const handleCreateKeyDown = (
    e:React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key ==='Enter') {
      createTask();
    }
  };



  if (isLoadingTasks)
    return <p className={classes["loading-message"]}>Загрузка контента...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className={classes["create-task"]}>
        {isCreating ? (
          <input
            type='text'
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleCreateKeyDown}
            placeholder='Введите задачу и нажмите Enter'
            autoFocus
          />
        ) : (
          <button onClick={() => setIsCreating(true)}>
            + Добавить задачу
          </button>
        )}
      </div>
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
    </>
  );
}
