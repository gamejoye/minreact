import { Fiber, FiberRoot } from "./ReactInternalTypes";
import { Lane, DefaultLane } from "./ReactFiberLane";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import { completeWork } from "./ReactCompleteWork";
import { commitMutationEffects } from "./ReactCommitWork";
import { HostRoot } from "./ReactWorkTag";


let workInProgressRoot: FiberRoot | null = null;
let workInProgress: Fiber | null = null;


function markUpdateLaneFromFiberToRoot(
  sourceFiber: Fiber,
  lane: Lane,
): FiberRoot | null {
  
  let parent = sourceFiber.return;
  let node = sourceFiber;
  while(parent !== null) {
    node = parent;
    parent = parent.return;
  }

  if(node.tag === HostRoot) {
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
  ensureRootIsScheduled(root);
}

/**
 * 保证当前root能更新的都已经更新了
 */
function ensureRootIsScheduled(root: FiberRoot) {
  performConcurrentWorkOnRoot(root);
}

/**
 * 用于获取当前渲染的优先级
 * 这里默认返回DefaultLane
 * why?
 * 因为我还没写到优先级调度😂
 */
export function requestUpdateLane(fiber: Fiber): Lane {
  return DefaultLane;
}


export function performConcurrentWorkOnRoot(root: FiberRoot) {
  // 1. 调度renderConcurrent进行渲染虚拟don树
  renderRootConcurrent(root);

  // 2. 调用commmitRoot处理XXXMutationEffects 同时把虚拟dom映射到真实dom上

  // 3. 判断当前渲染进度 如果渲染完成 -> commitRoot
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  commitRoot(root);

  // 4. 对于可中断调度 还要判断当前任务是否已经完成
}


export function renderRootConcurrent(root: FiberRoot) {
  // 1. 对当前要之前的渲染刷新帧栈 ( 如果当前渲染是一个全新的渲染 而不是被中断后重新执行的渲染 )
  if (workInProgressRoot === null) {
    // 这是一个全新的渲染
    prepareFreshStack(root);
  }

  // 2. 循环调用workLoopConcurrent进行并发渲染
  workLoopConcurrent();
  workInProgressRoot = null;
}

export function workLoopConcurrent() {
  /**
   * while(workInProgress !== null && !shouldYield()) { }
   */
  console.error('workLoopConcurrent starts')
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
  console.error('workLoopConcurrent ends')
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
    console.log('completedWork: ', completedWork)
    const current = completedWork.alternate;
    completeWork(current, completedWork);

    if (completedWork.sibling !== null) {
      workInProgress = completedWork.sibling;
      return;
    }

    workInProgress = completedWork = completedWork.return;

  } while (completedWork !== null);
}

export function commitRoot(root: FiberRoot) {
  const container: Element = root.containerInfo;
  const finishedWork = root.finishedWork;
  root.finishedWork = null;
  console.log('container: ', container);
  console.log('finishedWork: ', finishedWork);


  /**
   * 异步调度刷新PasssiveEffects
   * PassiveEffects其实就是useEffect
   */

  /**
   * 这里react还有一个处理beforeMutations的步骤
   * 这里mini-react并没有实现
   * why？因为beforeMutations的是处理带有Snapshot的， 只有class组件才会带有这个flag
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
}

/**
 * ******************************************************************
 * **              这里会创建workInProgress(刷新帧栈)                 **
 * ******************************************************************
 */
export function prepareFreshStack(root: FiberRoot) {
  root.finishedWork = null;

  workInProgressRoot = root;
  workInProgress = createWorkInProgress(root.current, null);

  return workInProgress;
}