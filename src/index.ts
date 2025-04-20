import { nextTickQueue, microTaskQueue } from "./core/queues"
import { Task } from "./core/task"
import { EventLoop } from "./core/event-loop"
import { scheduleTimeout } from "./core/scheduler"
import { createTask } from "./helpers"

nextTickQueue.enqueue(createTask('nextTick', () => console.log("[nextTick executed]")));
microTaskQueue.enqueue(createTask('microTask', () => console.log("[microTask executed]")));

scheduleTimeout(() => {
  console.log('scheduled timeout for 1000 sec')
}, 1000);

console.log("Queue Initialized");

const eventLoop = new EventLoop();
eventLoop.run();

// eventLoop.stop();

