import { Mutation, NoFlags, Placement, PlacementAndUpdate, Update } from "./ReactFiberFlag";
import { Fiber, FiberRoot } from "./ReactInternalTypes";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTag";


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


function commitMutationEffectsOnFiber(
  fiber: Fiber
) {
  const flags = fiber.flags;

  const primaryFlags = flags & (Placement | Update);
  console.log(fiber, primaryFlags)

  switch (primaryFlags) {
    case Placement: {
      console.log('Placement Fiber', fiber);
      commitPlace(fiber);
      break;
    }
    case PlacementAndUpdate: {
      console.log('PlacementAndUpdate Fiber', fiber);
      break;
    }
    case Update: {
      console.log('Update Fiber', fiber);
      break;
    }
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
    mini-react bug
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
      if (node.child === null) {
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