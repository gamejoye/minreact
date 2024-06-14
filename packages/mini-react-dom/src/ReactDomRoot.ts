import { ReactElement } from "react";
import { ReactDomRoot } from "./ReactDomInternalTypes";
import { ConcurrentTag, Fiber, FiberRoot, createContainer, updateContainer } from "@minreact/mini-react-reconciler"

export const internalKey = '__miniReactContainer';

export function createRoot(containerInfo: Element): ReactDomRoot {
  const root = createContainer(containerInfo, ConcurrentTag);
  // 连接dom和fiber
  markContainerAsRoot(root.current, containerInfo);
  return new (ReactDomRoot as any)(root);
}

function markContainerAsRoot(hostRoot: Fiber, containerInfo: Element) {
  (containerInfo as any)[internalKey] = hostRoot;
}

function ReactDomRoot(
  this: any,
  root: FiberRoot
) {
  this._internalRoot = root;
}

ReactDomRoot.prototype.render = function (children: ReactElement) {
  const root = this._internalRoot;
  /**
   * 直接同步调用渲染
   * updateContainer函数是 react-dom和react-reconciler之间的桥梁
   * 自此进入reconciler调用
   */
  updateContainer(children, root);
}
