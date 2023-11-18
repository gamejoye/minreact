import { Fiber, FiberRoot } from "./ReactInternalTypes"
import { RootTag, ConcurrentTag } from "./ReactWorkTag"
import { createFiberRoot } from "./ReactFiberRoot"
import { ReactElement } from "@mini-react/mini-react-dom/src/ReactDomInternalTypes";

// 创建Fiber树根节点  
export function createContainer(
  containerInfo: Element,
  tag: RootTag,
): FiberRoot {
  const root = createFiberRoot(containerInfo, ConcurrentTag);
  return root;
}

export function updateContainer(
  children: ReactElement,
  root: FiberRoot
) {

}


/**
 * 这个函数的作用是告诉react进行虚拟dom(fiber树)的更新
 */
function scheduleUpdateOnFiber() {

}