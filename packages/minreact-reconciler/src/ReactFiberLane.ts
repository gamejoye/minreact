import { FiberRoot } from "..";
export type Lane = number;
export type Lanes = number;

export const NoLanes = /*             */ 0b00000000;
export const NoLane = /*              */ 0b00000000;
export const SyncLane = /*            */ 0b00000001; // 同步更新的优先级最高
export const DefaultLane = /*         */ 0b00000010; // Concurrent更新优先级
export const TransitionLane = /*      */ 0b00000100; // Transition优先级最低


/**
 * 实际上就是获取二进制最低位
 * eg. x = 0b00000110 -x = 0b11111010
 * 回忆一下补码： 先求反码再加1
 */
export function getHighestPriority(lane: Lane): Lane {
  return lane & (-lane);
}

export function mergeLanes(a: Lanes, b: Lanes): Lane {
  return a | b;
}

/**
 * 获取当前需要优先处理的优先级
 */
export function getNextLanes(root: FiberRoot, wipLanes: Lanes) {
  const pendingLanes = root.pendingLanes;

  if (pendingLanes === NoLanes) {
    return NoLanes;
  }

  // 比较当前待处理和当前正在处理的优先级
  const nextLane = getHighestPriority(pendingLanes);
  if (wipLanes === NoLanes) {
    return nextLane;
  }

  const wipLane = getHighestPriority(wipLanes);

  if (nextLane >= wipLane) {
    // 当前正在处理事件的优先级更高
    return wipLanes;
  }

  return nextLane;
}

/**
 * 
 */
