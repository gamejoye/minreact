import { ReactElement } from "react"
import { FunctionComponent, HostComponent, HostRoot, HostText, WorkTag } from "./ReactWorkTag"
import { Fiber, FiberKey } from "./ReactInternalTypes"
import { NoFlags } from "./ReactFiberFlag"

export function createHostFiber() {
  return createFiber(HostRoot, null, null);
}

export function createFiber(
  tag: WorkTag,
  pendingProps: any,
  key: FiberKey
): Fiber {
  return new (FiberNode as any)(tag, pendingProps, key);
}

export function createWorkInProgress(current: Fiber, pendingProps: any): Fiber {
  let workInProgress = createFiber(
    current.tag,
    pendingProps,
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

  workInProgress.alternate = current;
  current.alternate = workInProgress;
  return workInProgress;
}

/**
 * 简单起见 这里只处理了函数组件和host组件(div, p, span, etc... )
 */
export function createFiberFromElement(
  element: ReactElement
): Fiber {
  const { key, props, type } = element;
  let tag: WorkTag;
  if (typeof type === 'function') {
    tag = FunctionComponent;
  } else {
    tag = HostComponent
  }
  const fiber = createFiber(tag, props, key);
  fiber.type = type;
  return fiber;
}

export function createFiberFromText(
  content: string
) {
  const fiber = createFiber(HostText, content, null);
  fiber.type = '#text'
  return fiber;
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
