import { ConcurrentTag, WorkTag } from "./ReactWorkTag"
import { Fiber, FiberKey } from "./ReactInternalTypes"
import { NoFlags } from "./ReactFiberFlag"

export function createHostFiber() {
  return createFiber(ConcurrentTag, null, null);
}

export function createFiber(
  tag: WorkTag,
  pendingProps: any,
  key: FiberKey
): Fiber {
  return new (FiberNode as any)(tag, pendingProps, key);
}

export function createWorkInProgrss(current: Fiber) {
  let workInProgress = createFiber(
    current.tag,
    null,
    current.key
  );
  workInProgress.type = current.type;
  workInProgress.stateNode = current.stateNode; // fiberRoot

  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  workInProgress.sibling = current.sibling;
  workInProgress.child = current.child;
  workInProgress.index = current.index;
  workInProgress.flags = current.flags;

  return workInProgress;
}

function FiberNode(
  this: any,
  tag: WorkTag,
  pendingProps: any,
  key: FiberKey,
) {
  this.tag = tag;
  this.key = key;
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.pendingState = null;
  this.memoizedState = null;
  this.updateQueue = null;
  this.return = null;
  this.sibling = null;
  this.child = null;
  this.alternate = null;
  this.stateNode = null;
  this.index = 0;
  this.deletions = null;
  this.subTreeFlags = NoFlags;
  this.flags = NoFlags;
}
