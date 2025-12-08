import classes from './Task.module.css'
import Checkbox from '@mui/material/Checkbox';
function Task( {task}) {
    return (
        <div className={classes.task}>
            <div className={classes['task-check']}>
                <input 
                    type='checkbox'
                    id={`checkbox-${task.title}`}
                />    
            </div>
            <div className={classes['task-info']}>
                <h3 className={classes['task-info_title']}>{task.title}</h3>
                <p className={classes['task-info_description']}>{task.description}</p>
            </div>
            <div className={classes['task-actions']}>

            </div>

        </div>
    )
}

export default Task;
