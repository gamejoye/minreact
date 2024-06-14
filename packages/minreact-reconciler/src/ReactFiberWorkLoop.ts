import { Fiber, FiberRoot } from "./ReactInternalTypes";
import { Lane, DefaultLane, TransitionLane, NoLane, SyncLane, Lanes, getNextLanes, NoLanes, getHighestPriority } from "./ReactFiberLane";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import { completeWork } from "./ReactCompleteWork";
import { commitMutationEffects, commitPassiveMountEffects, commitPassiveUnmountEffects } from "./ReactCommitWork";
import { HostRoot } from "./ReactWorkTag";
import { scheduleCallback, shouldYieldToHost } from "@minreact/minreact-scheduler";
import { NoFlags, Passive, PassiveMask } from "./ReactFiberFlag";
import { ReactCurrentBatchConfig } from "./ReactBatchConfig";
import { DefaultEventPriority, DiscreteEventPriority, getCurrentUpdatePriority } from "./ReactEventPriorities";

type RootExitStatus = 0 | 1;
const RootInProgress: RootExitStatus = 0;
const RootCompleted: RootExitStatus = 1;

let workInProgressRoot: FiberRoot | null = null;
let workInProgress: Fiber | null = null;
let workInProgressRootExitStatus: RootExitStatus = RootInProgress;

let rootWithPassiveEffects: FiberRoot | null = null;

function markUpdateLaneFromFiberToRoot(
  sourceFiber: Fiber,
  lane: Lane,
): FiberRoot | null {

  let parent = sourceFiber.return;
  let node = sourceFiber;
  while (parent !== null) {
    node = parent;
    parent = parent.return;
  }

  if (node.tag === HostRoot) {
    return (node.stateNode as FiberRoot);
  }

  return null;
}

/**
 * 这个函数的作用是告诉react进行虚拟dom(fiber树)的更新
 */
export function scheduleUpdateOnFiber(
  fiber: Fiber,
  lane: Lane
) {
  const root: FiberRoot = markUpdateLaneFromFiberToRoot(fiber, lane);
  if (root === null) {
    return;
  }

  // 标记
  root.pendingLanes |= lane;
  ensureRootIsScheduled(root);
}

/**
 * 保证当前root能更新的都已经更新了
 */
function ensureRootIsScheduled(root: FiberRoot) {

  // 优先级
  const nextLanes = getNextLanes(
    root,
    NoLanes
  );

  if (nextLanes === NoLanes) {
    // 没有任务了
    root.callbackNode = null;
    root.callbackPriority = NoLane;
    return;
  }

  // 节流设置
  // eg 对于连续多次的setState只设置一个task
  const existingCallbackPriority = root.callbackPriority;
  const newCallbackPriority = getHighestPriority(nextLanes);
  if (
    existingCallbackPriority === newCallbackPriority
  ) {
    // 同样的优先级
    return;
  }

  // 调度
  root.callbackPriority = newCallbackPriority;
  root.callbackNode = scheduleCallback(
    performConcurrentWorkOnRoot.bind(null, root)
  );
}

function flushPassiveEffects() {
  if (rootWithPassiveEffects === null) {
    return;
  }

  const root = rootWithPassiveEffects;
  rootWithPassiveEffects = null;

  commitPassiveUnmountEffects(root.current);
  commitPassiveMountEffects(root.current);
}


export function performConcurrentWorkOnRoot(root: FiberRoot, isTimeout: boolean) {

  const originalCallbackNode = root.callbackNode;

  // 1. 调度renderConcurrent进行渲染虚拟don树
  const lanes = getNextLanes(root, NoLanes);
  const exitStatus = renderRootConcurrent(root, lanes);

  // 2. 判断当前渲染进度 如果渲染完成 -> commitRoot
  if (exitStatus === RootCompleted) {
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    commitRoot(root);
  }

  // 3. 对于可中断调度 还要判断当前任务是否已经完成
  if (root.callbackNode === originalCallbackNode) {
    // 任务被中断了
    console.warn('***********************任务被中断了*************************');
    return performConcurrentWorkOnRoot.bind(null, root);
  }
  return null;
}


export function renderRootConcurrent(root: FiberRoot, lanes: Lanes) {
  // 1. 对当前要之前的渲染刷新帧栈 ( 如果当前渲染是一个全新的渲染 而不是被中断后重新执行的渲染 )
  if (workInProgressRoot === null) {
    // 这是一个全新的渲染
    prepareFreshStack(root);
  }

  // 2. 循环调用workLoopConcurrent进行并发渲染
  workLoopConcurrent();

  if (workInProgress !== null) {
    return RootInProgress;
  } else {
    workInProgressRoot = null;
    return workInProgressRootExitStatus;
  }
}

export function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYieldToHost()) {
    performUnitOfWork(workInProgress);
  }
}

export function performUnitOfWork(unitOfWork: Fiber) {

  const current = unitOfWork.alternate;

  let next = null;
  next = beginWork(current, unitOfWork);

  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next === null) {
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}


export function completeUnitOfWork(unitOfWork: Fiber): void {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    completeWork(current, completedWork);

    if (completedWork.sibling !== null) {
      workInProgress = completedWork.sibling;
      return;
    }

    workInProgress = completedWork = completedWork.return;

  } while (completedWork !== null);

  // 完成所有fiber节点的complete阶段
  workInProgressRootExitStatus = RootCompleted;
}

export function commitRoot(root: FiberRoot) {
  // TODO
  const container: Element = root.containerInfo;
  const finishedWork = root.finishedWork;
  root.pendingLanes &= ~root.callbackPriority;
  root.finishedWork = null;
  root.callbackNode = null;
  root.callbackPriority = NoLanes;


  /**
   * 异步调度刷新PasssiveEffects
   * PassiveEffects其实就是useEffect
   */
  do {
    flushPassiveEffects();
  } while (rootWithPassiveEffects !== null);

  /**
   * 这里react还有一个处理beforeMutations的步骤
   * 这里minreact并没有实现
   * 因为beforeMutations的是处理带有Snapshot的， 只有class组件才会带有这个flag
   */

  /**
   * 这里实现mutation相关的操作
   * 处理真实dom
   */
  commitMutationEffects(root, finishedWork);
  //container.appendChild(finishedWork.child.child.stateNode)
  root.current = finishedWork;

  /**
   * 处理layoutEffects
   */

  /**
   * 设置rootWithPassiveEffects
   * 准备异步处理useEffect
   */
  if (
    (finishedWork.subtreeFlags & PassiveMask) !== NoFlags ||
    (finishedWork.flags & PassiveMask) !== NoFlags
  ) {
    rootWithPassiveEffects = root;
    scheduleCallback(() => {
      flushPassiveEffects();
      return null;
    });
  }
}

/**
 * ******************************************************************
 * **              这里会创建workInProgress(刷新帧栈)                 **
 * ******************************************************************
 */
export function prepareFreshStack(root: FiberRoot) {
  root.finishedWork = null;

  workInProgressRoot = root;
  workInProgressRootExitStatus = RootInProgress;
  workInProgress = createWorkInProgress(root.current, null);

  return workInProgress;
}

/**
 * 用于获取当前更新的优先级
 */
export function requestUpdateLane(fiber: Fiber): Lane {

  // 判断是transition优先级
  const isTransition = ReactCurrentBatchConfig.transition !== null;
  if (isTransition) {
    return TransitionLane;
  }

  // 判断事件优先级
  const event = window.event;

  if (event === undefined) {
    return DefaultLane;
  }

  switch (event.type) {
    case 'click': {
      // 需要紧急处理的事件
      return DiscreteEventPriority;
    }
    default: {
      return DefaultEventPriority;
    }
  }
}
