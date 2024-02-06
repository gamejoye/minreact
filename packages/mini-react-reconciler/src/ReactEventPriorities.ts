import { DefaultLane, Lane, NoLane, SyncLane } from "./ReactFiberLane";

// EventPriority 其实就是Lane的一个子集
// 可以简单认为是Lane换了个名字
export type EventPriority = Lane;

export const DiscreteEventPriority: EventPriority = SyncLane;
export const DefaultEventPriority: EventPriority = DefaultLane;

let currentUpdatePriority: EventPriority = NoLane;

export function getCurrentUpdatePriority(): EventPriority {
  return currentUpdatePriority;
}

export function setCurrentUpdatePriority(newPriority: EventPriority) {
  currentUpdatePriority = newPriority;
}
