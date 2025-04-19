import { nextTickQueue, microTaskQueue, intervalQueue, timeoutQueue } from "./queues";
import { Task } from "./task";

export class EventLoop {
  private shouldContinue: boolean = true; 
  private iterationCount: number = 0;

  public stop(){ 
    console.log("[EventLoop] Stopping event loop");
    this.shouldContinue = false;
  }

  public runNextTickQueue(){
    console.log(`[EventLoop] Processing nextTick queue (size: ${nextTickQueue.length})`);
    while(!nextTickQueue.isEmpty()){
      const task = nextTickQueue.dequeue();
      try{
        console.log(`[EventLoop] Executing nextTick task ${task?.id}`);
        task?.callback();        
      }catch(error){
        console.error("[EventLoop] Error in processing nextTick Queue:", error);
      }
    }
  }

  public runMicroTaskQueue(){
    console.log(`[EventLoop] Processing microTask queue (size: ${microTaskQueue.length})`);
    while(!microTaskQueue.isEmpty()){
      const task = microTaskQueue.dequeue();
      try{
        console.log(`[EventLoop] Executing microTask task ${task?.id}`);
        task?.callback();
      }catch(error){
        console.error("[EventLoop] Error in processing microTask Queue:", error);
      }
    }
  }

  public runOnce(){
    this.iterationCount++;
    console.log(`[EventLoop] Starting iteration ${this.iterationCount}`);

    while(true){
      console.log('[EventLoop] Running nextTick phase');
      this.runNextTickQueue();

      if(!nextTickQueue.isEmpty()) {
        console.log('[EventLoop] New tasks added to nextTick queue, continuing...');
        continue;
      }

      console.log('[EventLoop] Running microTask phase');
      this.runMicroTaskQueue();

      if(!nextTickQueue.isEmpty()) {
        console.log('[EventLoop] New tasks added to nextTick queue, continuing...');
        continue;
      }

      console.log('[EventLoop] Iteration completed');
      break;
    }
  }

  public run() {
    console.log('[EventLoop] Initializing event loop');
    console.log('[EventLoop] Starting main loop');

    const loop = () => {
      if(!this.shouldContinue) {
        console.log('[EventLoop] Main loop stopped');
        return;
      }
      this.runOnce();

      setImmediate(loop);
    }

    loop();
  }
}