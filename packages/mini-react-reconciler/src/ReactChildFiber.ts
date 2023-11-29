import { ReactElement } from "react"
import { Fiber } from "./ReactInternalTypes";
import { ChildDeletion, Placement } from "./ReactFiberFlag";
import { createWorkInProgress, createFiberFromElement, createFiberFromText } from "./ReactFiber";
import { HostText } from "./ReactWorkTag";


/**
 * 当前模块最主要的函数就是reconcileChildFibers
 * 这里放到ChildReconciler的目的是， 要区分mount阶段和update阶段
 * 对于mount阶段的fiber节点并不需要打flag标记 （em 你可以简单的这么理解）
 * 其余的逻辑在mount阶段和update阶段都是一样的
 */

function ChildReconciler(isMount: boolean) {
  function placeSingleChild(
    newFiber: Fiber
  ) {
    if (!isMount && newFiber.alternate === null) {
      newFiber.flags |= Placement;
    }
    return newFiber;
  }

  function createChild(
    returnFiber: Fiber,
    newChild: any,
  ): Fiber | null {
    if ((typeof newChild === 'string' && newChild !== '')
      || typeof newChild === 'number'
    ) {
      const created = createFiberFromText('' + newChild);
      created.return = returnFiber;
      return created;
    }

    if (typeof newChild === 'object' && newChild !== null) {
      if (Array.isArray(newChild)) {
        // 数组类型
        // 这里暂时不处理
        return null;
      }
      const created = createFiberFromElement(newChild);
      created.return = returnFiber;
      return created;
    }

    return null;
  }

  /**
   * 对于returnFiber 添加ChildDeletion副作用 方便在commit阶段处理 
   */
  function deleteChild(
    returnFiber: Fiber,
    childToDelete: Fiber
  ) {
    if(isMount) {
      // 对于一个处在mount阶段的fiber节点
      // 不应该存在deleteChild这个操作
      return;
    }
    const deletions = returnFiber.deletions;
    if (deletions === null) {
      returnFiber.deletions = [childToDelete];
      returnFiber.flags |= ChildDeletion;
    } else {
      deletions.push(childToDelete);
    }
  }

  /**
   * react默认只对旧元素进行右移动 
   */
  function placeChild(
    newFiber: Fiber,
    lastPlacedIndex: number,
    newInx: number
  ): number {
    newFiber.index = newInx;
    if(isMount) {
      return lastPlacedIndex;
    }
    const current = newFiber.alternate;
    if (current !== null) {
      const oldInx = current.index;
      if (oldInx < lastPlacedIndex) {
        // 所有复用节点中的最大下标大于 当前需要复用的节点的下标
        // 需要对当前需要复用节点进行右移
        // why? 可能对这里产生很大的疑惑
        /**
         * 举个例子吧
         * old: A B C D
         * new: B A C D
         * 第一次 B复用了old的B节点 此时呢 lastPlaceIndex是1
         * 第二次 我们打算复用old的A节点 那么 我们是不是要把A这个element进行右移动才能得到 B A 呢 lastPlaceIndex是1
         * 第三次 我们打算复用old的C节点 此时lastPlaceIndex是1 < 2 所以我们不会对C这个element进行右移 lastPlaceIndex是2
         * 第四次 跟第三次同样的道理 lastPlaceIndex是3
         */
        newFiber.flags |= Placement;
        return lastPlacedIndex;
      }
      // 需要移动
      return oldInx;
    } else {
      // 新增节点
      newFiber.flags |= Placement;
      return lastPlacedIndex;
    }
  }

  /**
   * 删除掉currenFiberChild往右的所有同级节点 (实际上就是打标记)
   */
  function deleteRemainingChildren(
    returnFiber: Fiber,
    currentFiberChild: Fiber | null
  ) {
    let childToDelete = currentFiberChild;
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
  }

  /**
   * 复用fiber节点
   */
  function useFiber(
    fiber: Fiber,
    pendingProps: any,
  ) {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.sibling = null;
    clone.index = 0;
    return clone;
  }

  function mapRemainingChildren(
    currentFirstChild: Fiber,
  ): Map<string | number, Fiber> {
    const existingChildren: Map<string | number, Fiber> = new Map();
    let existingChild = currentFirstChild;
    while (existingChild !== null) {
      const key = existingChild.key === null ? existingChild.index : existingChild.key;
      existingChildren.set(key, existingChild);
      existingChild = existingChild.sibling;
    }
    return existingChildren;
  }

  function updateElement(
    returnFiber: Fiber,
    current: Fiber | null,
    element: ReactElement,
  ): Fiber {
    const elementType = element.type;
    if (current === null
      || current.type !== elementType
    ) {
      // 新建节点
      if (current === null) {
        const created = createFiberFromElement(element);
        created.return = returnFiber;
        return created;
      }
      const existing = useFiber(current, element.props);
      existing.return = returnFiber;
      return existing;
    }
    const created = createFiberFromElement(element);
    created.return = returnFiber;
    return created;
  }

  function updateTextNode(
    returnFiber: Fiber,
    current: Fiber | null,
    textContent: string,
  ) {
    if (current === null || current.tag !== HostText) {
      // 新增节点
      const created = createFiberFromText(textContent);
      created.return = returnFiber;
      return created;
    } else {
      // 更新节点
      const existing = useFiber(current, textContent);
      existing.return = returnFiber;
      return existing;
    }
  }

  function updateFromMap(
    existingChildren: Map<string | number, Fiber>,
    returnFiber: Fiber,
    newIdx: number,
    newChild: any,
  ): Fiber | null {
    if ((typeof newChild === 'string' && newChild !== '')
      || typeof newChild === 'number'
    ) {
      const matchedFiber = existingChildren.get(newIdx);
      return updateTextNode(returnFiber, matchedFiber, '' + newChild);
    }

    if (typeof newChild === 'object' && newChild !== null) {

      if (Array.isArray(newChild)) {
        // Fragment类型
        // 暂时不处理🥸
        return null;
      }

      const key = newChild.key === null ? newIdx : newChild.key;
      const matchedFiber = existingChildren.get(key) || null;
      return updateElement(returnFiber, matchedFiber, newChild);
    }

    return null;
  }


  /**
   * 对于新的节点是单节点的情况
   * element.propds.children = { xxx: xxx }
   */
  function reconcileSingleElement(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    element: ReactElement,
  ): Fiber {
    const key = element.key;
    let child = currentFirstChild;
    while (child !== null) {
      if (child.key === key) {
        const elementType = element.type;
        if (elementType === child.type) {
          // key相同 类型相同 可以复用
          // 复用当前fiber(child)
          // 同时删除掉同一层剩余的所有其他节点
          deleteRemainingChildren(returnFiber, child.sibling);
          const existing = useFiber(child, element.props);
          existing.return = returnFiber;
          return existing;
        } else {
          // key相同 类型不同 无法复用
          // 删除该层所有节点 (除了key为null的情况，同一层的key都是不同的)
          deleteRemainingChildren(returnFiber, child);
          break;
        }
      } else {
        deleteChild(returnFiber, child);
      }
    }
    const created = createFiberFromElement(element);
    created.return = returnFiber;
    return created;
  }

  /**
   * 对于新的节点是文本节点的情况
   * element.propds.children = 'xxx'
   */
  function reconcileSingleTextNode(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    textContent: string,
  ): Fiber {
    /**
     * 判断是否可以复用
     * 同时要删除同层的其他节点
     */
    if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
      // 可以复用
      deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
      const existing = useFiber(currentFirstChild, textContent);
      existing.return = returnFiber;
      return existing;
    }
    deleteRemainingChildren(returnFiber, currentFirstChild);
    const created = createFiberFromText(textContent);
    created.return = returnFiber;
    return created
  }

  /**
   * 对于新的节点是数组的情况
   * element.propds.children = [xxx, xxx]
   */
  function reconcileChildrenArray(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChildren: Array<any>,
  ): Fiber {
    let resultingFirstChild: Fiber | null = null;
    let previousNewFiber: Fiber | null = null;

    let oldFiber = currentFirstChild;
    let lastPlacedIndex = 0; // 上一次从prevChildren中复用的节点的最大下标
    let newIdx = 0;
    if (currentFirstChild === null) {
      // mount阶段
      for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChildren[newIdx]);

        if (newFiber !== null) {
          lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
          if (resultingFirstChild === null) {
            resultingFirstChild = newFiber;
          } else {
            previousNewFiber.sibling = newFiber;
          }
          previousNewFiber = newFiber;
        }
      }
      return resultingFirstChild;
    }

    const existingChildren = mapRemainingChildren(currentFirstChild);

    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      const newFiber = updateFromMap(
        existingChildren,
        returnFiber,
        newIdx,
        newChildren[newIdx]
      )
      if (newFiber !== null) {
        const current = newFiber.alternate;
        if (current !== null) {
          const key = newFiber.key === null ? current.index : newFiber.key;
          existingChildren.delete(key);
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (resultingFirstChild === null) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
    }

    existingChildren.forEach(child => deleteChild(returnFiber, child));

    return resultingFirstChild;
  }



  function reconcileChildFibers(
    returnFiber: Fiber,
    currentFirstFiber: Fiber | null,
    nextChildren: any
  ): Fiber {
    if (typeof nextChildren === 'object' && nextChildren !== null) {
      if (Array.isArray(nextChildren)) {
        /**
         * 有多个孩子
         * eg. 
         * <div>
         *  <p><p/>
         *  <span><span/>
         * <div/>
         * 在这个例子中 nextChildren = [<p>, <span>]
         */
        return reconcileChildrenArray(
          returnFiber,
          currentFirstFiber,
          nextChildren
        )
      }
      return placeSingleChild(
        reconcileSingleElement(
          returnFiber,
          currentFirstFiber,
          nextChildren
        )
      )
    }

    if ((typeof nextChildren === 'string' && nextChildren !== '')
      || typeof nextChildren === 'number'
    ) {
      return placeSingleChild(
        reconcileSingleTextNode(
          returnFiber,
          currentFirstFiber,
          '' + nextChildren
        )
      )
    }

    return null;
  }
  return reconcileChildFibers;
}

export const reconcileChildFibers = ChildReconciler(false);
export const mountChildFibers = ChildReconciler(true);

