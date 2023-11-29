import { createInstance, createTextInstance } from "@mini-react/mini-react-dom/src/ReactComponent";
import { Fiber } from "./ReactInternalTypes";
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./ReactWorkTag";
import { NoFlags } from "./ReactFiberFlag";


function appendAllChildren(
  parent: Element,
  workInProgrss: Fiber
) {
  let node = workInProgrss.child;
  while(node !== null && node !== workInProgrss) {
    if(node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode);
    } else if(node.child !== null) {
      // 函数组件
      node = node.child;
      continue;
    }
    while(node.sibling === null) {
      if(node.return === null || node.return === workInProgrss) {
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

  while(child !== null) {

    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;

    child = child.sibling; // move
  }
  completedWork.subtreeFlags = subtreeFlags;
}

export function completeWork(completedFiber: Fiber): null {

  switch (completedFiber.tag) {
    case FunctionComponent:
      bubbleProperties(completedFiber);
      break;
    case HostRoot:
      bubbleProperties(completedFiber);
      break;
    case HostText: {
      completedFiber.stateNode = createTextInstance(completedFiber.pendingProps);
      bubbleProperties(completedFiber);
      break;
    }
    case HostComponent: {
      const instance = createInstance(
        completedFiber.type,
        completedFiber.pendingProps,
        completedFiber
      );
      completedFiber.stateNode = instance
      appendAllChildren(instance, completedFiber);
      bubbleProperties(completedFiber);
      break;
    }
  }

  return null;
}