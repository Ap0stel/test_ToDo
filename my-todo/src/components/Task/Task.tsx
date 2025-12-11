import classes from './Task.module.css'
import { Todo } from '../../types'

interface TaskProps {
    task: Todo;
}

function Task({ task }: TaskProps) {
    return (
        <div className={classes.task}>
            <div className={classes['task-check']}>
                <input
                    type='checkbox'
                    id={`checkbox-${task.title}`}
                    defaultChecked={task.completed}
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
