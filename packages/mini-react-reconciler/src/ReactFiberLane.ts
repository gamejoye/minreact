import { EvenPriority } from "./ReactEventPriorities"
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
export function getHighestPriority(lane: Lane): EvenPriority {
  return lane & (-lane);
}

export function mergeLanes(a: Lanes, b: Lanes): Lane {
  return a | b;
}

export function getNextLanes() {
  
}