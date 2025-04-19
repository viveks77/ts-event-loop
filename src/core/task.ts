export interface Task {
  id: number;
  callback: () => void;
  type: "nextTick" | "immediate" | "timeout" | "interval" | "microTask" | "io" | "close";
  timeStamp?: number;
  interval?: number;
}