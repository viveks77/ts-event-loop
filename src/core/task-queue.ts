import { Task } from "./task";

export class TaskQueue {
  private queue: Task[] = [];
  
  enqueue(task: Task){
    this.queue.push(task);
  }

  dequeue(): Task | undefined {
    return this.queue.shift();
  }

  peek(): Task | undefined {
    return this.queue[0];
  }

  isEmpty(): boolean {
    return this.queue.length == 0;
  }

  clear(): void {
    this.queue = [];
  }

  get length(): number {
    return this.queue.length;
  }

}
