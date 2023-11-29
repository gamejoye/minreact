import { Fiber } from "./ReactInternalTypes";
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./ReactWorkTag";
import { reconcileChildFibers, mountChildFibers } from "./ReactChildFiber"
import { SharedQueue, cloneUpdateQueue } from "./ReactUpdateQueue";


function updateHostRoot(
  current: Fiber,
  workInProgress: Fiber
): Fiber | null {
  if (current === null) {
    throw new Error('current 不应该为 null');
  }
  const currentQueue: SharedQueue = current.updateQueue;
  if (currentQueue === null) {
    throw new Error(`
      HostFiberRoot的updateQueue不应该为null
      mini-react bug
    `)
  }
  cloneUpdateQueue(current, workInProgress);
  const queue: SharedQueue = workInProgress.updateQueue;
  const first = queue.pending;
  if (first === null) {
    throw new Error(`
      这里应该有需要的更新
      可能是mini-react的bug
    `)
  }
  const nextChildren = first.payload.element;
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

function updateHostComponent(
  current: Fiber | null,
  workInProgress: Fiber
): Fiber | null {
  const nextProps = workInProgress.pendingProps;

  if (workInProgress.tag === HostText) {
    return null;
  }

  const nextChildren = nextProps.children;
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

function updateFunctionComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any
): Fiber | null {
  if (typeof Component !== 'function') {
    throw new Error(`
      Component应该是一个函数
      mini-react bug
    `)
  }
  const props = workInProgress.pendingProps;
  let children = Component(props);
  reconcileChildren(
    current,
    workInProgress,
    children
  );
  return workInProgress.child;
}

function updateHostText(
  current: Fiber | null,
  workInProgress: Fiber
) {
  return null;
}

function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any
) {
  if (current === null) {
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren
    );
  } else {
  console.log('--------------------: ', workInProgress, '\n', current, '\n', nextChildren)
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    );
  }
}

export function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
): Fiber | null {
  console.warn('workInProgrss: ', workInProgress);
  switch (workInProgress.tag) {
    case FunctionComponent: {
      const Component = workInProgress.type;
      return updateFunctionComponent(
        current,
        workInProgress,
        Component
      );
    }
    case HostComponent: {
      return updateHostComponent(
        current,
        workInProgress
      );
    }
    case HostRoot: {
      return updateHostRoot(
        current,
        workInProgress
      );
    }
    case HostText: {
      return updateHostText(
        current,
        workInProgress
      );
    }
  }

  throw new Error(
    `unknow unit of work tag ${workInProgress.tag}`
  );

}