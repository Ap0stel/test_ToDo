import "./App.css";
import TasksFetch from "./components/TasksFetch/TasksFetch";
import { Container } from "@mui/material";

function App() {
  return (
    <Container maxWidth='lg'>
      <TasksFetch />
    </Container>
  );
}

export default App;
