import { createTask } from "../helpers";
import { immediateQueue, intervalQueue, ioQueue, timeoutQueue } from "./queues";
import { Task } from "./task";
import fs from 'fs';


let taskId = 0;

export function scheduleTimeout(callback: () => void, delayInSeconds: number){
  const task: Task = {
    id: taskId++,
    callback,
    type: "timeout",
    timeStamp: Date.now() + delayInSeconds
  }
  timeoutQueue.enqueue(task);
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