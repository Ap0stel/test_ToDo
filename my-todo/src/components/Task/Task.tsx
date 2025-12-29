import { useState, useEffect } from "react";
import { Todo } from "../../types";
import {
  Box, 
  Checkbox,
  IconButton, 
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Delete, Opacity } from "@mui/icons-material";

interface TaskProps {
  task: Todo;
  onToggle: (id: number) => void;
  onUpdateTitle: (taskId: number, newTitle: string) => void;
  onDelete: (taskId:number) => void;
  deletingTaskId: number | null;
}

function Task({ task, onToggle, onUpdateTitle, onDelete, deletingTaskId, }: Readonly<TaskProps>) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingTitle, setEditingTitle] = useState(task.title);

    const isDeleting = deletingTaskId === task.id;

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
    <Box 
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        borderBottom: '1px solid #e0e0e0',
        opacity: isDeleting ? 0.5 : 1,
        pointerEvents: isDeleting ? 'none' : 'auto',
      }}
    >
      <Checkbox
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        disabled={isDeleting}
      />

      {isEditing ? (
        <TextField 
          size="small"
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onBlur={handleSaveTitle}
          autoFocus
          fullWidth
        />
      ) : (
        <Typography
          sx={{flexGrow: 1, cursor: 'pointer'}}
          onClick={() => setIsEditing(true)}
        >
          {task.title}
        </Typography>
      )}

      <IconButton
        onClick={() => onDelete(task.id)}
        disabled={isDeleting}
        color='error'
      >
        {isDeleting ? <CircularProgress size={18} /> : <Delete />}
      </IconButton>
    </Box>
  );
}            

export default Task;
