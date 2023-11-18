import { RootTag } from "./ReactWorkTag";
import { FiberRoot } from "./ReactInternalTypes";
import { NoLanes } from "./ReactFiberLane";
import { createHostFiber } from "./ReactFiber";

/**
 * 
 * @param containerInfo // 官方提供的示例中 containerInfo就指的是 <div id='root'></div>
 * @param tag // Fiber节点类型
 * @returns 
 */
export function createFiberRoot(
  containerInfo: Element,
  tag: RootTag,
): FiberRoot {
  const root: FiberRoot = new (FiberRootNode as any)(
    containerInfo,
    tag
  );
  const initializedFiber = createHostFiber();
  root.current = initializedFiber;
  initializedFiber.stateNode = root;
  return root;
}


function FiberRootNode(
  this: any,
  containerInfo: Element,
  tag: RootTag,
) {
  this.tag = tag;
  this.containerInfo = containerInfo;
  this.current = null;
  this.finishedWork = null;
  this.finishedLanes = NoLanes;
  this.pendingProps = null;
  this.memoizedProps = null;
  this.pendingState = null;
  this.memoizedState = null;
}