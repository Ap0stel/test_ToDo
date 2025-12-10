import { useState } from "react";
import "./App.css";
import TaskList from "./components/TaskList/TaskList";

// TODO:
// 1) сделать функцию, которая запрашивает todos отсюда: https://jsonplaceholder.typicode.com/todos, используя fetch
// 2) использовать эту функцию в компоненту App через useEffect
// 3) после того, как данные запрошены, засеттить их в useState (setTasks), чтобы их можно было использовать везде внутри компоненты App, а не только в промисе внутри useEffect
// 4) tasks должны передаться в TaskList, оба списка должны зарендериться

// ==============================

// 5) После этого добавить в компонент еще одно состояние const [isLoadingTasks, setIsLoadingTasks] = useState(false)
// если isLoadingTasks === true, то рендерить какую-то заглушку типа "Загружаю данные...", когда данные загружены, менять этот флаг (isLoadingTasks) на false и рендерить TaskList

function App() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Task 1", description: "Task 1 description", done: false },
    { id: 2, title: "Task 2", description: "Task 2 description", done: false },
    { id: 3, title: "Task 3", description: "Task 3 description", done: false },
    { id: 4, title: "Task 4", description: "Task 4 description", done: false },
  ]);
  // const tasks = [
  //   {id: 1, title: 'Task 1', description: 'Task 1 description', done: false},
  //   {id: 2, title: 'Task 2', description: 'Task 2 description', done: false},
  //   {id: 3, title: 'Task 3', description: 'Task 3 description', done: false},
  //   {id: 4, title: 'Task 4', description: 'Task 4 description', done: false},
  // ]

  return (
    <div className="main-wrapper">
      <TaskList title="Активные" tasks={tasks} />
      <TaskList title="Завершенные" tasks={tasks} />
    </div>
  );
}

export default App;
