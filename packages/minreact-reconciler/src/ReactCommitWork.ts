import { updateDOMProperties, updateFiberProps } from "@minreact/minreact-dom";
import { ChildDeletion, Mutation, NoFlags, PassiveMask, Placement, PlacementAndUpdate, Update } from "./ReactFiberFlag";
import { Fiber, FiberRoot } from "./ReactInternalTypes";
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./ReactWorkTag";
import { FunctionComponentUpdateQueue } from "./ReactFiberHooks";
import { HookHasEffect } from "./ReactHookFlag";


let nextEffect: Fiber | null;

export function commitMutationEffects(
  root: FiberRoot,
  firstChild: Fiber
) {

  nextEffect = firstChild;
  commitMutationEffectsBegin();
}

// commitMutationEffects_begin
function commitMutationEffectsBegin() {
  while (nextEffect !== null) {
    const fiber = nextEffect;

    // 处理删除
    const deletions = fiber.deletions;
    if (deletions !== null) {
      for (const childToDelete of deletions) {
        commitDeletion(childToDelete, fiber);
      }
    }

    const child = fiber.child;
    // 考虑向下迭代或者执行complete
    // 这里有一个小优化就是 如果子节点并不需要处理mutation的话 直接complete当前节点
    // 判断子节点是否需要处理mutation的方法就是通过subtreeFlags
    if (child !== null && (fiber.subtreeFlags & Mutation) !== NoFlags) {
      nextEffect = child;
    } else {
      commitMutationEffectsComplete();
    }
  }
}

// commitMutationEffects_complete
function commitMutationEffectsComplete() {
  while (nextEffect !== null) {
    const fiber = nextEffect;

    commitMutationEffectsOnFiber(fiber);

    const sibling = fiber.sibling;
    if (sibling !== null) {
      nextEffect = sibling;
      return;
    }

    nextEffect = fiber.return;
  }
}

export function commitPassiveUnmountEffects(firstFiber: Fiber) {
  nextEffect = firstFiber;
  commitPassiveUnmountEffectsBegin();
}

function commitPassiveUnmountEffectsBegin() {
  while (nextEffect !== null) {
    const fiber = nextEffect;

    if ((fiber.flags & ChildDeletion) != NoFlags) {
      // 子树有节点被删除了
      // 不管deps有没有变化都需要处理useEffect的unmount
      const deletions = fiber.deletions;
      if (deletions !== null) {
        for (const fiberToDelete of deletions) {
          nextEffect = fiberToDelete;
          commitPassiveUnmountEffectsInsideOfDeletedTreeBegin(fiberToDelete);
        }
        // reset
        nextEffect = fiber;
      }
    }

    const child = fiber.child;
    if (child !== null && (fiber.subtreeFlags & PassiveMask) !== NoFlags) {
      nextEffect = child;
    } else {
      commitPassiveUnmountEffectsComplete();
    }
  }
}

function commitPassiveUnmountEffectsComplete() {
  while (nextEffect !== null) {
    const fiber = nextEffect;

    if ((fiber.flags & PassiveMask) !== NoFlags) {
      commitPassiveUnmountOnFiber(fiber);
    }

    const sibling = fiber.sibling;
    if (sibling !== null) {
      nextEffect = sibling;
      break;
    }

    nextEffect = fiber.return;
  }
}

function commitPassiveUnmountEffectsInsideOfDeletedTreeBegin(subRoot: Fiber) {
  while (nextEffect !== null) {
    const fiber = nextEffect;

    commitPassiveUnmountInsideDeletedTreeOnFiber(fiber);

    const child = fiber.child;
    if (child !== null) {
      nextEffect = child;
    } else {
      commitPassiveUnmountEffectsInsideOfDeletedTreeComplete(subRoot);
    }
  }
}

function commitPassiveUnmountEffectsInsideOfDeletedTreeComplete(subRoot: Fiber) {
  while (nextEffect !== null) {
    const fiber = nextEffect;

    const sibling = fiber.sibling;
    if (sibling !== null) {
      nextEffect = sibling;
      break;
    }

    if (fiber.return === subRoot) {
      // fiber子树的complete工作完成
      nextEffect = null;
      break;
    }
    nextEffect = fiber.return;
  }
}

function commitPassiveUnmountInsideDeletedTreeOnFiber(fiber: Fiber) {
  switch (fiber.tag) {
    case FunctionComponent: {
      const updateQueue = fiber.updateQueue as FunctionComponentUpdateQueue;
      const lastEffect = updateQueue.lastEffect;
      if (lastEffect !== null) {
        const firstEffect = lastEffect.next;
        let effect = firstEffect;
        do {
          const destroy = effect.destroy;
          if (typeof destroy === 'function') {
            destroy();
          }
        } while (effect !== firstEffect);
      }
    }
  }
}

export function commitPassiveMountEffects(firstFiber: Fiber) {
  nextEffect = firstFiber;
  commitPassiveMountEffectsBegin();
}

function commitPassiveMountEffectsBegin() {
  while (nextEffect !== null) {
    const fiber = nextEffect;

    const child = fiber.child;
    if (child !== null && (fiber.subtreeFlags & PassiveMask) !== NoFlags) {
      nextEffect = child;
    } else {
      commitPassiveMountEffectsComplete();
    }
  }
}

function commitPassiveMountEffectsComplete() {
  while (nextEffect !== null) {
    const fiber = nextEffect;

    if ((fiber.flags & PassiveMask) !== NoFlags) {
      commitPassiveMountOnFiber(fiber);
    }

    const sibling = fiber.sibling;
    if (sibling !== null) {
      nextEffect = sibling;
      break;
    }

    nextEffect = fiber.return;
  }
}

function commitPassiveMountOnFiber(fiber: Fiber) {
  switch (fiber.tag) {
    case FunctionComponent: {
      const updateQueue = fiber.updateQueue as FunctionComponentUpdateQueue;
      const lastEffect = updateQueue === null ? null : updateQueue.lastEffect;
      if (lastEffect !== null) {
        const firstEffect = lastEffect.next;
        let effect = firstEffect;
        do {
          const tag = effect.tag;
          if ((tag & HookHasEffect) != NoFlags) {
            const create = effect.create;
            effect.destroy = create();
          }
          effect = effect.next;
        } while (effect !== firstEffect);
      }
    }
  }
}

function commitPassiveUnmountOnFiber(fiber: Fiber) {
  switch (fiber.tag) {
    case FunctionComponent: {
      const updateQueue = fiber.updateQueue as FunctionComponentUpdateQueue;
      const lastEffect = updateQueue === null ? null : updateQueue.lastEffect;

      if (lastEffect !== null) {
        const firstEffect = lastEffect.next;
        let effect = firstEffect;
        do {
          if ((effect.tag & HookHasEffect) != NoFlags) {
            const destroy = effect.destroy;
            effect.destroy = undefined;
            if (typeof destroy === 'function') {
              destroy();
            }
          }
          effect = effect.next;
        } while (effect !== firstEffect);
      }
    }
  }
}


function commitMutationEffectsOnFiber(
  fiber: Fiber
) {
  const flags = fiber.flags;

  const primaryFlags = flags & (Placement | Update);

  switch (primaryFlags) {
    case Placement: {
      commitPlace(fiber);
      fiber.flags &= ~Placement;
      break;
    }
    case PlacementAndUpdate: {
      commitPlace(fiber);
      fiber.flags &= ~Placement;

      const current = fiber.alternate;
      commitWork(current, fiber);
      break;
    }
    case Update: {
      const current = fiber.alternate;
      commitWork(current, fiber);
      break;
    }
  }
}

function commitDeletion(
  current: Fiber,
  nearestMountedAncestor: Fiber,
) {
  let node = current;

  let currentParent: Fiber;

  while (true) {
    let parent = current.return;
    let isParentFind = false;
    while (true) {
      if (!parent) {
        throw new Error(
          `
          期望有一个parent
          但是在findParent过程中出现null
          `
        )
      }
      switch (parent.tag) {
        case HostComponent: {
          currentParent = parent;
          isParentFind = true;
          break;
        }
        case HostRoot: {
          currentParent = parent;
          isParentFind = true;
          break;
        }
      }
      if (isParentFind) break;
      parent = parent.return;
    }

    if (node.tag === HostComponent || node.tag === HostText) {
      // host fiber
      /**
       * 处理node的subTree
       * eg:
       * (
       *  <div>
       *    <FunctionComponent1 />
       *    <FunctionComponent2 />
       *    <div>
       *      <FunctionComponent3 />
       *    </div>
       *  </div>
       * )
       */
      (currentParent.stateNode as Element).removeChild(node.stateNode as Element);
    } else if (node.tag === FunctionComponent) {
      if (node.child !== null) {
        node = node.child;
        continue;
      }
    } else {
      throw new Error(
        `
        unknow fiber.tag
        `
      )
    }

    while (node.sibling === null) {
      if (node === current || node.return === null || node.return === current) {
        // commit completed !
        return;
      }
      node = node.return;
    }
    node = node.sibling;
  }
}

function commitPlace(
  finishedWork: Fiber
) {
  const parentFiber = getHostParent(finishedWork);

  switch (parentFiber.tag) {
    case HostRoot: {
      const parent = (parentFiber.stateNode as FiberRoot).containerInfo;
      const before = getHostSibling(finishedWork); // gethostSibling很重要！
      insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
      break;
    }
    case HostComponent: {
      const parent = parentFiber.stateNode;
      const before = getHostSibling(finishedWork); // gethostSibling很重要！
      insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
      break;
    }
  }
}

function commitWork(
  current: Fiber | null,
  finishedWork: Fiber
) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      // 处理layoutEffect
      break;
    }
    case HostComponent: {
      const instance = finishedWork.stateNode;
      if (instance !== null) {
        const newProps = finishedWork.memoizedProps;
        const oldProps = current !== null ? current.memoizedProps : newProps;
        const updateQueue = finishedWork.updateQueue;
        finishedWork.updateQueue = null;
        if (updateQueue !== null) {
          commitUpdate(instance, updateQueue, oldProps, newProps);
        }
      }
      break;
    }
    case HostText: {
      const textInstance = finishedWork.stateNode;
      const newText = finishedWork.memoizedProps;
      const oldText = current === null ? newText : current.memoizedProps;

      if (oldText !== newText) {
        commitTextUpdate(textInstance, oldText, newText);
      }
      break;
    }
  }
}

function commitUpdate(
  instance: Element,
  updatePayload: Array<[string, any]>,
  oldProps: any,
  newProps: any,
) {
  updateDOMProperties(instance, updatePayload);
  updateFiberProps(instance, newProps);
}

function commitTextUpdate(
  textInstance: Element,
  oldText: string,
  newText: string
) {
  textInstance.nodeValue = newText;
}

function isHostParent(
  fiber: Fiber
) {
  return fiber.tag === HostComponent
    || fiber.tag === HostRoot;
}


function getHostParent(fiber: Fiber): Fiber {
  let parent = fiber.return;
  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent;
    }

    parent = parent.return;
  }

  throw new Error(`
    ${fiber} 应该有一个hostParent但是没有找到
    minreact bug
  `)
}

// 很重要的一个函数
// 对于理解diff算法有着承上的作用
function getHostSibling(fiber: Fiber): Element | null {
  let node = fiber;
  while (true) {
    while (node.sibling === null) {
      // 在之前的向下探索的过程中没有找到兄弟节点
      // 需要向上回溯
      if (node.return === null || isHostParent(node.return)) {
        // 没有办法找到兄弟节点
        return null;
      }
      node = node.return;
    }

    node = node.sibling; // 移动到兄弟节点进行搜索

    let needContinue = false;
    // 如果不是对应真实dom的虚拟dom
    while (node.tag !== HostComponent && node.tag !== HostText) {
      if ((node.flags & Placement) !== NoFlags) {
        /**
         * ******************************************
         * 如果当前节点是新插入的或者说是需要进行移动的节点 
         * 跳过                    
         * 可以你会有疑问， 解释如下：
         * 
         * 假设我当前显示在屏幕(current)的节点是 A, B, C, D
         * 我当前需要提交的(wip)的节点是 D, A, B, C
         * 那么A, B, C这三个Fiber上面会被打上Place标记 （react默认只对旧节点右移）
         * 那么如果你需要找到A的HostSibling
         * 如果你没有当前的这个判断
         * 有一个问题就是， 你就会尝试到B的孩子里面找
         * 因为对于A的父亲它要执行的之后appendChild而不需要执行insertBefore
         * ******************************************
         */
        needContinue = true;
        break;
      }
      // 尝试向下探索
      if (!needContinue && node.child === null) {
        needContinue = true;
        break;
      } else {
        node = node.child;
      }
    }

    if (needContinue) continue;

    if ((node.flags & Placement) === NoFlags) {
      return node.stateNode;
    }
  }
}

function insertOrAppendPlacementNodeIntoContainer(
  node: Fiber,
  before: Element | null,
  parent: Element,
) {
  const tag = node.tag;

  if (tag == HostComponent || tag === HostText) {
    const instance = node.stateNode;
    if (before !== null) {
      parent.insertBefore(instance, before);
    } else {
      parent.appendChild(instance);
    }
  } else {
    // 函数组件
    let child = node.child;
    if (child !== null) {
      insertOrAppendPlacementNodeIntoContainer(child, before, parent);

      let sibling = child.sibling;
      while (sibling !== null) {
        insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}