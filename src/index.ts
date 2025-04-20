import { nextTickQueue, microTaskQueue } from "./core/queues"
import { Task } from "./core/task"
import { EventLoop } from "./core/event-loop"
import { scheduleTimeout } from "./core/scheduler"

let taskId = 0

const createTask  = (callback : () => void, type: Task["type"]): Task => ({
  id: taskId++,
  callback,
  type,
})

nextTickQueue.enqueue(createTask(() => console.log("[nextTick executed]"), 'nextTick'));
microTaskQueue.enqueue(createTask(() => console.log("[microTask executed]"), 'microTask'));

scheduleTimeout(() => {
  console.log('scheduled timeout for 1000 sec')
}, 1000);

console.log("Queue Initialized");

const eventLoop = new EventLoop();
eventLoop.run();

// eventLoop.stop();

