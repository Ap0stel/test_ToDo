import { useEffect, useMemo, useState } from "react";
import TaskList from "../TaskList/TaskList";
import classes from './TasksFetch.module.css';
import { Todo } from '../../types';

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
                setError('Ошибка в получении контента');
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

    if (isLoadingTasks) return <p className={classes['loading-message']}>Загрузка контента...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <TaskList title='Активные' tasks={activeTasks} />
            <TaskList title='Завершенные' tasks={completedTasks} />
        </>
    );

}
