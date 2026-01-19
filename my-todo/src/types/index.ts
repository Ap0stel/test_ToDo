export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
}

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
  columnId: number;
  user?: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Column {
  id: number;
  title: string;
  isCompleted: boolean;
}