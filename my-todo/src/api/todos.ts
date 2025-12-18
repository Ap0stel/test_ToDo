const API_BASE_URL = "https://jsonplaceholder.typicode.com";

export interface Todo {
  userId: number; // 
  id: number; 
  title: string; 
  completed: boolean;
}

export async function fetchTodos(): Promise<Todo[]> {

  const response = await fetch(`${API_BASE_URL}/todos`);

  if (!response.ok) {
    throw new Error(`Failed to fetch todos: ${response.statusText}`);
  }

  return response.json();
}

export async function createTodo(
  title: string,
  completed: boolean,
  userId: number = 1,
): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      title,
      completed,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create todo: ${response.statusText}`);
  }
  return response.json();
}


export async function updateTodo(
  id: number,
  updates: Partial<Pick<Todo, "title" | "completed">>
): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update todo: ${response.statusText}`);
  }
  return response.json();
}


export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete todo: ${response.statusText}`);
  }
}

