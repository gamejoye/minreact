import { Flags } from "./ReactFiberFlag";
import { Lanes } from "./ReactFiberLane";
import { WorkTag, RootTag } from "./ReactWorkTag";

export type FiberKey = string | null;

export type Fiber = {
  /**
   * 标识当前fiber类型
   * eg. 函数组件 Host组件
   */
  tag: WorkTag,
  /**
   * 优化算法reconciler使用
   */
  key: FiberKey,
  /**
   * 
   * 标识类型
   * eg. 函数组件的函数 div p span
   */
  type: any,

  stateNode: any,

  pendingProps: any,
  memoizedProps: any,
  pendingState: any,
  memoizedState: any,


  /**
   * 父亲节点
   */
  return: Fiber | null,
  /**
   * 右边兄弟节点
   */
  sibling: Fiber | null,
  /**
   * 孩子节点
   */
  child: Fiber | null,
  /**
   * 当前fiber在与它从一级的所有fibers中的下标
   * 同样用于优化算法reconciler使用
   */
  index: number,

  /**
   * 副作用
   */
  flags: Flags,
  subTreeFlags: Flags,
  deletions: Array<Fiber> | null,

  /**
   * 双缓冲技术
   */
  alternate: Fiber | null
};


type BaseFiberRootProperties = {
  tag: RootTag,
  current: Fiber,
  finishedWork: Fiber | null,
  containerInfo: any,
  pendingLanes: Lanes,
};


export type FiberRoot = {
  [key in keyof Fiber]: Fiber[key]
} & BaseFiberRootProperties;


