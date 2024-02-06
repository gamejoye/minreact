import { ReactElement } from "react";
import { Fiber, FiberRoot } from "./ReactInternalTypes"
import { RootTag } from "./ReactWorkTag"
import { createFiberRoot } from "./ReactFiberRoot"
import { createUpdate, enqueueUpdate } from "./ReactUpdateQueue";
import { requestUpdateLane, scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";



// 创建Fiber树根节点
export function createContainer(
  containerInfo: Element,
  tag: RootTag
): FiberRoot {
  const root = createFiberRoot(containerInfo, tag);
  return root;
}

export function updateContainer(
  children: ReactElement,
  root: FiberRoot,
) {
  const current = root.current;
  const lane = requestUpdateLane(current);
  const update = createUpdate();
  update.payload = {
    element: children
  }
  update.lane = lane;
  enqueueUpdate(update, current);
  scheduleUpdateOnFiber(current, lane);
}

