import { createTask } from "../helpers";
import { intervalQueue, ioQueue, timeoutQueue } from "./queues";
import { Task } from "./task";
import fs from 'fs';


let timeoutId = 0;

export function scheduleTimeout(callback: () => void, delayInSeconds: number){
  const task: Task = {
    id: timeoutId++,
    callback,
    type: "timeout",
    timeStamp: Date.now() + delayInSeconds
  }
  timeoutQueue.enqueue(task);
}

export function scheduleInterval(callback: () => void, intervalInSeconds: number){
  const task: Task = {
    id: timeoutId++,
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