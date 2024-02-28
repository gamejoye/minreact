import { createInstance, createTextInstance, diffProperties, isEvent, isProperty, setInitialDOMProperties } from "@mini-react/mini-react-dom";
import { Fiber } from "./ReactInternalTypes";
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./ReactWorkTag";
import { NoFlags, Update } from "./ReactFiberFlag";


function markUpdate(workInProgress: Fiber) {
  workInProgress.flags |= Update;
}

function appendAllChildren(
  parent: Element,
  workInProgrss: Fiber
) {
  let node = workInProgrss.child;
  while (node !== null && node !== workInProgrss) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode);
    } else if (node.child !== null) {
      // 函数组件
      node = node.child;
      continue;
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgrss) {
        return;
      }
      node = node.return;
    }
    node = node.sibling;
  }
}

function appendInitialChild(
  parentInstance: Element,
  childInstance: Element | Text
) {
  parentInstance.appendChild(childInstance);
}


// 收集下一层孩子及其孩子节点的兄弟节点的信息到completedWork
function bubbleProperties(
  completedWork: Fiber
) {
  let subtreeFlags = NoFlags;
  let child = completedWork.child;

  while (child !== null) {

    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;

    child = child.sibling; // move
  }
  completedWork.subtreeFlags = subtreeFlags;
}




function updateHostComponent(
  current: Fiber,
  workInProgress: Fiber,
  type: string,
  newProps: any,
) {
  const oldProps = current.memoizedProps;

  if (oldProps === newProps) {
    // skip
    return;
  }

  const instance = workInProgress.stateNode;
  const updateQueue = diffProperties(instance, type, oldProps, newProps);
  workInProgress.updateQueue = updateQueue;
  if (updateQueue) {
    markUpdate(workInProgress);
  }
}

function updateHostText(
  current: Fiber,
  workInProgress: Fiber,
  oldText: string,
  newText: string,
) {
  if (oldText !== newText) {
    markUpdate(workInProgress);
  }
};

export function completeWork(
  current: Fiber | null,
  completedFiber: Fiber
): null {
  switch (completedFiber.tag) {
    case FunctionComponent:
      bubbleProperties(completedFiber);
      break;
    case HostRoot:
      bubbleProperties(completedFiber);
      break;
    case HostText: {
      const newText = completedFiber.memoizedProps;

      if (current !== null && completedFiber.stateNode !== null) {
        const oldText = current.memoizedProps;
        updateHostText(current, completedFiber, oldText, newText);
      } else {
        completedFiber.stateNode = createTextInstance(completedFiber.pendingProps);
      }

      bubbleProperties(completedFiber);
      break;
    }
    case HostComponent: {
      const newProps = completedFiber.pendingProps;
      const type = completedFiber.type;

      if (current !== null && completedFiber.stateNode !== null) {
        updateHostComponent(current, completedFiber, type, newProps);
      } else {
        const instance = createInstance(
          completedFiber.type,
          completedFiber.pendingProps,
          completedFiber
        );

        completedFiber.stateNode = instance;
        appendAllChildren(instance, completedFiber);
        setInitialDOMProperties(instance, type, newProps);
      }

      bubbleProperties(completedFiber);
      break;
    }
  }

  return null;
}