import classes from './Task.module.css'
import { Todo } from '../../types'

interface TaskProps {
    task: Todo;
    onToggle: (id: number) => void;
}

function Task({ task, onToggle }: TaskProps) {
    return (
        <div className={classes.task}>
            <div className={classes['task-check']}>
                <input
                    type='checkbox'
                    id={`checkbox-${task.id}`}
                    checked={task.completed}
                    onChange={() => onToggle(task.id)}
                />
            </div>
            <div className={classes['task-info']}>
                <h3 className={classes['task-info_title']}>{task.title}</h3>
            </div>
            <div className={classes['task-actions']}>

            </div>

        </div>
    )
}

export default Task;
