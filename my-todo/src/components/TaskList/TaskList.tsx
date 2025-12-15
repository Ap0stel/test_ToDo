import Task from "../Task/Task";
import classes from "./TaskList.module.css";
import { Todo } from "../../types";

interface TaskListProps {
  tasks: Todo[];
  title: string;
  onToggle: (id: number) => void;
  onUpdateTitle: (taskId: number, newTitle: string) => void;
}

export default function TaskList({
  tasks,
  title,
  onToggle,
  onUpdateTitle,
}: Readonly<TaskListProps>) {
  console.log("Tasks: ", tasks);
  return (
    <div className={classes.wraper}>
      <div className={classes["list-title"]}>{title}</div>
      <div className={classes["task-list"]}>
        {tasks.length
          ? tasks.map((task) => {
              return <Task task={task} key={task.id} onToggle={onToggle} onUpdateTitle={onUpdateTitle}/>;
            })
          : "Список задач пуст"}
      </div>
    </div>
  );
}
