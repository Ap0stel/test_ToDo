import { useEffect, useState } from "react";
import {
  Button,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { Column, User } from "../../types";

type Props = {
  columns: Column[];
  users: User[];
  onCreate: (title: string, userId: string, columnId: string) => void;
};

export function CreateTaskForm({ columns, users, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [columnId, setColumnId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  
  useEffect(() => {
    if (columnId && !columns.some(col => col.id === columnId)) {
        setColumnId('');
    }
  }, [columns, columnId]);


  const handleSubmit = () => {
    if (!title.trim() || !columnId || !userId) return;

    onCreate(title.trim(), userId, columnId);

    // сброс формы
    setTitle("");
    setColumnId("");
    setUserId("");
  };

  return (
    <Stack direction="row" spacing={3} alignItems="flex-start" mb={3}>
      <TextField
        label="Новая задача"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        size="small"
        autoFocus
      />

      <Select
        size="small"
        value={columnId}
        onChange={(e) => setColumnId(e.target.value)}
        displayEmpty
      >
        <MenuItem sx = {{ display: 'none'}} value="">
          <em>Выберите колонку</em>
        </MenuItem>

        {columns.map((col) => (
          <MenuItem key={col.id} value={col.id}>
            {col.title}
          </MenuItem>
        ))}
      </Select>

      <Select
        size="small"
        value={userId}
        onChange={(e) => setUserId((e.target.value))}
        displayEmpty
      >
        <MenuItem sx={{ display: "none" }} value="">
          <em>Выберите пользователя</em>
        </MenuItem>

        {users.map((user) => (
          <MenuItem key={user.id} value={user.id}>
            {user.name}
          </MenuItem>
        ))}
      </Select>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!title.trim() || !columnId || !userId}
      >
        Создать
      </Button>
    </Stack>
  );
}