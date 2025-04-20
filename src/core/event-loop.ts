import { nextTickQueue, microTaskQueue, intervalQueue, timeoutQueue, ioQueue } from "./queues";
import { Task } from "./task";

export class EventLoop {
  private shouldContinue: boolean = true; 
  private iterationCount: number = 0;

  public stop(){ 
    console.log("[EventLoop] Stopping event loop");
    this.shouldContinue = false;
  }

  public runNextTickQueue(){
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

  public runMicroTaskQueue(){
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

  public runScheulderQueue(){
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

      if(task.timeStamp! <= now){
        try{
          console.log("[EventLoop - Interval] Executing interval task");
          task.callback();
        }catch(error){
          console.error("[EventLoop] Error in interval:", error);
        }
        task.timeStamp = now + (task.interval || 0 )
      }

      intervalsToRun.push(task);
    }

    intervalsToRun.forEach((task) => intervalQueue.enqueue(task));
  }

  public runIoQueue(){
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

  public runOnce(){
    this.iterationCount++;
    // console.log(`[EventLoop] Iteration ${this.iterationCount}`);

    while(true){
      this.runNextTickQueue();
      if(!nextTickQueue.isEmpty()) continue;

      this.runMicroTaskQueue();
      if(!nextTickQueue.isEmpty()) continue;
      
      break;
    }
    this.runScheulderQueue();
    this.runIoQueue();
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