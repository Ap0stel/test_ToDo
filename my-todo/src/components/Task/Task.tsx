import { useState, useEffect } from "react";
import classes from "./Task.module.css";
import { Todo } from "../../types";

interface TaskProps {
  task: Todo;
  onToggle: (id: number) => void;
  onUpdateTitle: (taskId: number, newTitle: string) => void;
  onDelete: (taskId:number) => void;
}

function Task({ task, onToggle, onUpdateTitle, onDelete }: Readonly<TaskProps>) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingTitle, setEditingTitle] = useState(task.title);

    const handleStartEditing = () => {
        setIsEditing(true);
        setEditingTitle(task.title);
    };
    const handleSaveTitle = () => {
        onUpdateTitle(task.id, editingTitle);
        setIsEditing(false);
    };
    const handleCancelEditing = () => {
        setEditingTitle(task.title);
        setIsEditing(false);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSaveTitle();
      } else if (e.key === 'Escape') {
        handleCancelEditing();
      }
    };

    useEffect(() => {
      setEditingTitle(task.title);
    }, [task.title]);
  
  return (
    <div className={classes.task}>
      <div className={classes["task-actions"]}>
        <button
          className={classes["task-delete"]}
          onClick={() => onDelete(task.id)}>
          X
        </button>

      </div>
      <div className={classes["task-check"]}>
        <input
          type="checkbox"
          id={`checkbox-${task.id}`}
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
      </div>
      <div className={classes["task-info"]}>
        {isEditing ? (
          <input
            type='text'
            className={classes["task-info_title-input"]}
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyDown}
            autoFocus
          />  
        ) : (
          <h3
            className={classes["task-info"]}
            onClick={handleStartEditing}
          >
            {task.title}
          </h3>  
        )}
      </div>
      <div className={classes["task-actions"]}></div>
    </div>
  );
}

export default Task;
