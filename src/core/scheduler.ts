import { intervalQueue, timeoutQueue } from "./queues";
import { Task } from "./task";


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