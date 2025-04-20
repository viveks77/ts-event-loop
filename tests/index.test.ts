import { EventLoop } from "../src/core/event-loop";
import { intervalQueue, microTaskQueue, nextTickQueue, timeoutQueue } from "../src/core/queues";
import { readFile, scheduleInterval, scheduleTimeout } from "../src/core/scheduler";
import { createTask } from "../src/helpers";
import fs from 'fs';

describe("Event Loop", () => {

  let results: string[];
  let eventLoop: EventLoop;

  beforeEach(() => {
    nextTickQueue.clear();
    microTaskQueue.clear();
    timeoutQueue.clear();
    intervalQueue.clear();
    results = [];

    eventLoop = new EventLoop();
  });

  afterEach(() => {
    eventLoop.stop();
  })

  test("should run nextTick queue", () => {
    const task = createTask("nextTick", () => {
      console.log("[nexttick] executed");
      results.push("nexttick");
    })
    nextTickQueue.enqueue(task);

    eventLoop.run();
    expect(results).toEqual(["nexttick"]);
  });

  test("should run microtask queue", () => {
    const task = createTask("microTask", () => {
      console.log("[microtask] executed");
      results.push("microtask");
    });

    microTaskQueue.enqueue(task);

    eventLoop.run();
    expect(results).toEqual(["microtask"]);
  });

  test("should run timeout queue", (done) => {
    scheduleTimeout(() => {
      console.log("[timeout] executed");
      done();
    }, 1000);

    eventLoop.run();
  });

  test("should run interval queue", (done) => {
    let intervalCount = 0;
    scheduleInterval(() => {
      console.log("[interval] executed");
      if(intervalCount === 3){
        expect(intervalCount).toBe(3);
        done();
      }
      intervalCount++;
    }, 1000)

    eventLoop.run();
  })

  test("should run in order of priority: nextTick -> microTask -> timeout", () => {
    const nextTickTask = createTask("nextTick", () => {
      console.log("[nexttick] executed");
      results.push("nexttick");
    })

    const microTask = createTask("microTask", () => {
      console.log("[microtask] executed");
      results.push("microtask");
    })

    scheduleTimeout(() => {
      console.log("[timeout] executed");
      results.push("timeout");
    }, 1000);

    microTaskQueue.enqueue(microTask);
    nextTickQueue.enqueue(nextTickTask);

    eventLoop.run();
    setTimeout(() => {
      expect(results).toEqual(["nexttick", "microtask", "timeout"]);
    }, 1001).unref();
  });

  test("should handle errors in tasks", (done) => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation();

    const task = createTask("nextTick", () => {
      throw new Error("test error");
    })

    nextTickQueue.enqueue(task);

    scheduleTimeout(() => {
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
      done();
    }, 100);

    eventLoop.run();
  });

  test("should handle io queue", (done) => {
    let fileName = "demo.txt";
    let result = "";
    let textToWrite = "[EventLoop] ioTask";

    fs.writeFile(fileName, textToWrite, (err) => {
      if (err) {
        done(err);
        return;
      }

      readFile(fileName, (data, error) => {
        if(error) {
          done(error);
          return;
        }

        result = data;
        
        fs.unlink(fileName, (err) => {
          if (err) {
            done(err);
            return;
          }

          expect(result).toEqual(textToWrite);
          done();
        });
      });
    });

    eventLoop.run();
  });

})