import { TaskQueue } from "./task-queue";

const nextTickQueue = new TaskQueue();
const immediateQueue = new TaskQueue();
const timeoutQueue = new TaskQueue();
const intervalQueue = new TaskQueue();
const microTaskQueue = new TaskQueue();
const ioQueue = new TaskQueue();
const closeQueue = new TaskQueue();

export { nextTickQueue, immediateQueue, timeoutQueue, intervalQueue, microTaskQueue, ioQueue, closeQueue };