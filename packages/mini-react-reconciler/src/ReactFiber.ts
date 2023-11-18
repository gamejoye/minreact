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
