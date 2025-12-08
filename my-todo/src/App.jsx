import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Task from './components/Task/Task'
import TaskList from './components/TaskList/TaskList'

function App() {
  const [tasks, setTasks] = useState([
    {id: 1, title: 'Task 1', description: 'Task 1 description', done: false},
    {id: 2, title: 'Task 2', description: 'Task 2 description', done: false},
    {id: 3, title: 'Task 3', description: 'Task 3 description', done: false},
    {id: 4, title: 'Task 4', description: 'Task 4 description', done: false},
  ])
  // const tasks = [
  //   {id: 1, title: 'Task 1', description: 'Task 1 description', done: false},
  //   {id: 2, title: 'Task 2', description: 'Task 2 description', done: false},
  //   {id: 3, title: 'Task 3', description: 'Task 3 description', done: false},
  //   {id: 4, title: 'Task 4', description: 'Task 4 description', done: false},
  // ]

  return (
    <>
      <div className='main-wrapper'>
        <TaskList title='Активные'  tasks={tasks}/>
        <TaskList title='Завершенные' tasks={tasks}/>
      </div>
    </>
  )
}

export default App;
