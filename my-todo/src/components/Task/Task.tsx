import { useState, useEffect, useMemo } from "react";
import { Todo } from "../../types/index";
import { User } from "../../types/index";
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
  users: User[];
  onToggle: (id: number) => void;
  onUpdateTitle: (taskId: number, newTitle: string) => void;
  onDelete: (taskId:number) => void;
  deletingTaskId: number | null;
}

function Task({ task, users, onToggle, onUpdateTitle, onDelete, deletingTaskId, }: Readonly<TaskProps>) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingTitle, setEditingTitle] = useState(task.title);

    const isDeleting = deletingTaskId === task.id;

    const user = useMemo(
      () => users.find(u => u.id === task.userId),
      [users, task.userId]
    );

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
  console.log('users in Task: ', users);
  return (
    <Box 
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1,
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
      <Box sx={{flexGrow: 1, minWidth: 0}}>
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
          <Box display='flex' alignItems='center' gap={2}>
            <Typography
              sx={{flexGrow: 1, cursor: 'pointer'}}
              onClick={() => setIsEditing(true)}
            >
              {task.title}
            </Typography>

            <Typography
              sx={{
                maxWidth: 240,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                cursor: 'pointer',
                wordBreak: 'break-word',
                flexShrink: 1,
              }}
              onClick={() => setIsEditing(true)}
            >
              {user
                ? `${user.name} · ${user.email}`
                : 'Исполнитель не назначен'}
            </Typography>
          </Box>
        )}
      </Box>

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
