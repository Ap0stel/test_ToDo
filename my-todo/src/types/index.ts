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
  user?: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
}