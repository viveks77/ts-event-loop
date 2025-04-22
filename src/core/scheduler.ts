import { createTask } from "../helpers";
import { closeQueue, immediateQueue, intervalQueue, ioQueue, timeoutQueue } from "./queues";
import { Task } from "./task";
import fs from 'fs';


let taskId = 0;
export const activeTimeouts = new Map<number, Task>();
export const activeIntervals = new Map<number, Task>();

export function scheduleTimeout(callback: () => void, delayInSeconds: number){
  const task: Task = {
    id: taskId++,
    callback,
    type: "timeout",
    timeStamp: Date.now() + delayInSeconds
  }
  timeoutQueue.enqueue(task);
  activeTimeouts.set(task.id, task);

  return task.id;
}

export function scheduleInterval(callback: () => void, intervalInSeconds: number){
  const task: Task = {
    id: taskId++,
    callback,
    type: "interval",
    interval: intervalInSeconds,
    timeStamp: Date.now() + intervalInSeconds
  }
  intervalQueue.enqueue(task);
  activeIntervals.set(task.id, task);

  return task.id;
}

export function readFile(filePath: string, callback: (data: string, err?: Error) => void){
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if(err){
      console.error("Failed reading file");
      return;
    }

    const task = createTask("io", () => callback(data, undefined));
    ioQueue.enqueue(task);
  })
}

export function scheduleImmediate(callback: () => void) {
  const task: Task = {
    id: taskId++,
    callback,
    type: "immediate",
  }
  immediateQueue.enqueue(task);
}

export function myClose(callback: () => void, delay = 1000) {
  const task: Task = {
    id: ++taskId,
    type: 'close',
    callback,
  };

  // Simulate a stream/socket closing after a delay
  setTimeout(() => {
    closeQueue.enqueue(task);
  }, delay);
}

export function scheduleClearInterval(taskId: number){
  activeIntervals.delete(taskId);
}

export function scheduleClearTimeout(taskId: number){
  activeTimeouts.delete(taskId);
}

