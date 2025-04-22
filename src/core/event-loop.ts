import { nextTickQueue, microTaskQueue, intervalQueue, timeoutQueue, ioQueue, immediateQueue, closeQueue } from "./queues";
import { activeIntervals, activeTimeouts } from "./scheduler";
import { Task } from "./task";

export class EventLoop {
  private shouldContinue: boolean = true; 
  private iterationCount: number = 0;

  public stop(){ 
    console.log("[EventLoop] Stopping event loop");
    this.shouldContinue = false;
  }

  private runNextTickQueue(){
    while(!nextTickQueue.isEmpty()){
      const task = nextTickQueue.dequeue();
      try{
        console.log("[EventLoop - NextTick] Executing nextTick task");
        task?.callback();        
      }catch(error){
        console.error("[EventLoop - NextTick] Error in nextTick:", error);
      }
    }
  }

  private runMicroTaskQueue(){
    while(!microTaskQueue.isEmpty()){
      const task = microTaskQueue.dequeue();
      try{
        console.log("[EventLoop - MicroTask] Executing microTask task");
        task?.callback();
      }catch(error){
        console.error("[EventLoop - MicroTask] Error in microTask:", error);
      }
    }
  }

  private runScheulderQueue(){
    const now = Date.now();
    let timeoutsToRun: Task[] = [];

    while(!timeoutQueue.isEmpty() && timeoutQueue.peek()?.timeStamp! <= now){
      const task = timeoutQueue.dequeue();
      if(task){
        timeoutsToRun.push(task);
      }
    }

    timeoutsToRun.forEach((task) => {
      try{
        console.log("[EventLoop - TimeOut] Executing timeout task");

        if(activeTimeouts.has(task.id)){
          activeTimeouts.delete(task.id);
        }
        task?.callback();
      }catch(error){
        console.error("[EventLoop] Error in timeout:", error);
      }
    });

    let intervalsToRun: Task[] = [];
    const length = intervalQueue.length;
    for(let i = 0; i < length; i ++){
      const task = intervalQueue.dequeue();
      if(!task) continue;

      if(task.timeStamp! <= now && activeIntervals.has(task.id)){
        try{
          console.log("[EventLoop - Interval] Executing interval task");
          task.callback();
        }catch(error){
          console.error("[EventLoop] Error in interval:", error);
        }
        task.timeStamp = now + (task.interval || 0 )
      }

      if(activeIntervals.has(task.id)){
        intervalsToRun.push(task);
      }
    }

    intervalsToRun.forEach((task) => {
      if(activeIntervals.has(task.id)){
        intervalQueue.enqueue(task)
      }
    });
  }

  private runIoQueue(){
    while(!ioQueue.isEmpty()){
      try{
        let task = ioQueue.dequeue();
        console.log("[EventLoop - Interval] Executing io task");
        task?.callback();
      }catch(error){
        console.error("[EventLoop] Error executing file read");
      }
    }
  }

  private runImmediateQueue(){
    while(!immediateQueue.isEmpty()){
      try{
        const task = immediateQueue.dequeue();
        console.log("[EventLoop - Immediate ] Executing immediate task");
        task?.callback();
      }catch(error){
        console.error("[EventLoop] Error executing immediate queue");
      }
    }
  }

  private runCloseCallbacksPhase() {
    while (!closeQueue.isEmpty()) {
      const task = closeQueue.dequeue();
      try {
        console.log("[EventLoop - closeCallback ] Executing closeCallback task");
        task?.callback();
      } catch (err) {
        console.error(`Error in close callback:`, err);
      }
    }
  }

  public runOnce(){
    this.iterationCount++;

    while(true){
      this.runNextTickQueue();
      if(!nextTickQueue.isEmpty()) continue;

      this.runMicroTaskQueue();
      if(!nextTickQueue.isEmpty()) continue;
      
      break;
    }
    this.runScheulderQueue();
    this.runIoQueue();
    this.runImmediateQueue();
    this.runCloseCallbacksPhase();
  }

  public run() {
    console.log('[EventLoop] Starting');
    const loop = () => {

      // if(nextTickQueue.isEmpty() && microTaskQueue.isEmpty() && timeoutQueue.isEmpty()){
      //   this.stop();
      // }

      if(!this.shouldContinue) {
        console.log('[EventLoop] Stopped');
        return;
      }
      this.runOnce();
      setImmediate(loop);
    }
    loop();
  }
}