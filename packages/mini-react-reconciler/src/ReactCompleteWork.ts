import { createInstance, createTextInstance } from "@mini-react/mini-react-dom/src/ReactComponent";
import { Fiber } from "./ReactInternalTypes";
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./ReactWorkTag";


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

export function completeWork(completedFiber: Fiber): null {

  switch (completedFiber.tag) {
    case FunctionComponent:
      break;
    case HostRoot:
      break;
    case HostText: {
      completedFiber.stateNode = createTextInstance(completedFiber.pendingProps);
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
      break;
    }
  }

  return null;
}