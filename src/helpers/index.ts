import { Task } from "../core/task";

let taskId = 0;

export const createTask  = (type: Task["type"], callback: () => void): Task => ({
  id: taskId++,
  callback,
  type,
})