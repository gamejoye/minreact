import { Lane, NoLane } from "./ReactFiberLane"
import { Fiber } from "./ReactInternalTypes"

export type SharedQueue = {
  pending: Update | null
}

export type Update = {
  payload: any,
  next: Update | null,
  lane: Lane
}


export function createUpdate(): Update {
  return {
    payload: null,
    next: null,
    lane: NoLane
  }
}

export function enqueueUpdate(update: Update, fiber: Fiber) {
  const shared: SharedQueue = fiber.updateQueue;
  if (shared === null) {
    // 不是HostRootFiber
    return;
  }
  /*
    shared.pending指向的是最新的update
    4 -> 1 -> 2 -> 3
    shared.peding = 4

    对于一个新的update进入shared 新的shared如下: 
    5 -> 1 -> 2 -> 3 -> 4
    此时 shared.pending = 5
  */
  const pending = shared.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  shared.pending = update;
}

export function initializeUpdateQueue(fiber: Fiber) {
  const updateQueue: SharedQueue = {
    pending: null
  }
  fiber.updateQueue = updateQueue;
}

export function cloneUpdateQueue(
  current: Fiber,
  workInProgrss: Fiber
) {
  const currentQueue: SharedQueue = current.updateQueue;
  const queue = {
    pending: currentQueue.pending
  }
  workInProgrss.updateQueue = queue;
}