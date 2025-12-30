import Task from "../Task/Task";
import { Todo } from "../../types";
import {Box, Typography } from "@mui/material";
interface TaskListProps {
  tasks: Todo[];
  title: string;
  onToggle: (id: number) => void;
  onUpdateTitle: (taskId: number, newTitle: string) => void;
  onDelete: (taskId: number) => void;
  deletingTaskId: number | null;
}

export default function TaskList({
  tasks,
  title,
  onToggle,
  onUpdateTitle,
  onDelete,
  deletingTaskId,
}: Readonly<TaskListProps>) {
  console.log("Tasks: ", tasks);
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          px: 2,
          py: 1,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        {title}
      </Typography>

      <Box>
        {tasks.length ? (
          tasks.map((task) => (
            <Task
              key={task.id}
              task={task}
              onToggle={onToggle}
              onUpdateTitle={onUpdateTitle}
              onDelete={onDelete}
              deletingTaskId={deletingTaskId}
            />
          ))
        ) : (
          <Typography
            sx={{ p: 2 }}
            color="text.secondary"
          >
            Список задач пуст
          </Typography>
        )}
      </Box>
    </Box>
  );
}