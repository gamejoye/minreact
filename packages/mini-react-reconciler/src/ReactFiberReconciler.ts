import { ReactElement } from "react";
import { Fiber, FiberRoot } from "./ReactInternalTypes"
import { RootTag } from "./ReactWorkTag"
import { createFiberRoot } from "./ReactFiberRoot"
import { createUpdate, enqueueUpdate } from "./ReactUpdateQueue";
import { DefaultLane, Lane } from "./ReactFiberLane";
import { createWorkInProgrss } from "./ReactFiber";



let workInProgressRoot: FiberRoot | null = null;
let workInProgress: Fiber | null = null;



// 创建Fiber树根节点  
export function createContainer(
  containerInfo: Element,
  tag: RootTag,
): FiberRoot {
  const root = createFiberRoot(containerInfo, tag);
  return root;
}

export function updateContainer(
  children: ReactElement,
  root: FiberRoot
) {
  const current = root.current;
  const lane = requestUpdateLane(current);
  const update = createUpdate();
  update.payload = {
    element: children
  }
  update.lane = lane;
  enqueueUpdate(update, current);
  scheduleUpdateOnFiber(current, lane);
}


/**
 * 这个函数的作用是告诉react进行虚拟dom(fiber树)的更新
 */
function scheduleUpdateOnFiber(
  fiber: Fiber,
  lane: Lane
) {
  const root: FiberRoot = fiber.stateNode;
  if (root === null) {
    return;
  }
  ensureRootIsScheduled(root);
}

/**
 * 保证当前root能更新的都已经更新了
 */
function ensureRootIsScheduled(root: FiberRoot) {

}

/**
 * 用于获取当前渲染的优先级
 * 这里默认返回DefaultLane
 * why?
 * 因为我还没写到优先级调度😂
 */
function requestUpdateLane(fiber: Fiber): Lane {
  return DefaultLane;
}


function performConcurrentWorkOnRoot(root: FiberRoot) {
  // 1. 调度renderConcurrent进行渲染虚拟don树


  // 2. 调用commmitRoot处理XXXMutationEffects 同时把虚拟dom映射到真实dom上


  // 3. 对于可中断调度 还要判断当前任务是否已经完成
}


function renderRootConcurrent(root: FiberRoot) {
  // 1. 对当前要之前的渲染刷新帧栈 ( 如果当前渲染是一个全新的渲染 而不是被中断后重新执行的渲染 )
  if (workInProgressRoot === null) {
    // 这是一个全新的渲染
    prepareFreshStack(root);
  }

  // 2. 循环调用workLoopConcurrent进行并发渲染
  workLoopConcurrent();

  // 3. 判断当前渲染进度 如果渲染完成 -> commitRoot
  commitRoot(root);
}

function commitRoot(root: FiberRoot) {

}

function workLoopConcurrent() {
  /**
   * while(workInProgress !== null && !shouldYield()) { }
   */
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}


function performUnitOfWork(unitOfWork: Fiber) {
  let next = null;
  next = beginWork(unitOfWork);

  if(next === null) {
    next = completeUnitOfWork(unitOfWork);
  }
  workInProgress = next;
}


function beginWork(fiber: Fiber): Fiber | null {
  return null;
}


function completeUnitOfWork(completedFiber: Fiber): Fiber | null {
  return null;
}

/**
 * ******************************************************************
 * **              这里会创建workInProgress(刷新帧栈)                 **
 * ******************************************************************
 */
function prepareFreshStack(root: FiberRoot) {
  root.finishedWork = null;

  workInProgressRoot = root;
  workInProgress = createWorkInProgrss(root.current);

  return workInProgress;
}

