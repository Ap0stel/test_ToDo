import Task from '../Task/Task'
import classes from './TaskList.module.css'
export default function TaskList({tasks, title}) {
    console.log('Tasks: ', tasks)
    return (
        <div className={classes.wraper}>
            <div className={classes['list-title']}>{title}</div>
            <div className={classes['task-list']}>
                {
                    tasks.length 
                        ?   tasks.map((task) => {
                                return <Task task={task} key={task.id} />
                            })
                        :   'Список задач пуст'
                }
            </div>

        </div>
    )

}