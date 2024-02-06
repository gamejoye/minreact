import { peek, pop, push } from "./MinHeap";

export type Task = {
  id: number;
  callback: any;
  startTime: number;
  expirationTime: number;
  sortIndex: number;
};

let globalIdleDeadLine: IdleDeadline | null = null;
let taskQueue: Array<Task> = [];
// let timerQueue: Array<Task> = [];
let taskId = 0;


export function scheduleCallback(callback: any) {
  const startTime = getCurrentTime();

  // TODO
  // 对于每个不同优先级的任务 设置不同的timeout
  // 对于某个过期的任务 最终会采用同步不可中断的方式执行
  let timeout = 5000;

  const expirationTime = startTime + timeout;
  const task: Task = {
    id: taskId++,
    callback,
    startTime,
    expirationTime,
    sortIndex: -1,
  };

  task.sortIndex = expirationTime;
  push(taskQueue, task);
  return task;
}

export function shouldYieldToHost() {
  return globalIdleDeadLine === null ? false : globalIdleDeadLine.timeRemaining() < 5;
}

function workLoop(idleDeadline: IdleDeadline) {
  globalIdleDeadLine = idleDeadline;

  let currentTime = getCurrentTime();
  let currentTask = peek(taskQueue);

  while (currentTask !== null) {
    if (
      currentTask.expirationTime > currentTime &&
      shouldYieldToHost()
    ) {
      // 任务还没过期且此时需要把控制权让出给浏览器
      break;
    }

    const callback = currentTask.callback;

    if (typeof callback === 'function') {
      currentTask.callback = null;

      // 用于在fiber树构建阶段判断是否需要进行时间分片
      // 对于超时的任务需要同步渲染
      const isTimeout = currentTask.expirationTime <= currentTime;

      const continuationCallback = callback(isTimeout);
      if (typeof continuationCallback === 'function') {
        currentTask.callback = continuationCallback;
      }

    } else {
      pop(taskQueue);
    }

    currentTask = peek(taskQueue);
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function getCurrentTime() {
  return new Date().getTime();
}
