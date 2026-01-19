export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
}

export interface Todo {
  userId: number;
  id: string;
  title: string;
  columnId: string;
  user?: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
}
