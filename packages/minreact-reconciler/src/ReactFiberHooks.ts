import { requestUpdateLane, scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import { ReactCurrentDispatcher } from "./ReactDispatcher";
import { Flags, Passive } from "./ReactFiberFlag";
import { Lane, NoLane } from "./ReactFiberLane";
import { HookFlags, HookHasEffect, HookPassive } from "./ReactHookFlag";
import { Dispatcher, Fiber } from "./ReactInternalTypes";


type Update<S, A> = {
  action: A,
  next: Update<S, A>,
  lane: Lane,
}

export type UpdateQueue<S, A> = {
  pending: Update<S, A> | null,
  dispatch: Dispatch<A> | null,
  lastRenderedReducer: ((state: S, action: A) => S) | null,
  lastRenderedState: S | null
}

export type FunctionComponentUpdateQueue = {
  lastEffect: Effect | null,
};

export type Hook = {
  memoizedState: any,
  baseState: any,
  baseQueue: Update<any, any> | null,
  queue: any,
  next: Hook | null,
}

export type Effect = {
  tag: HookFlags,
  create: () => (() => undefined) | undefined,
  destroy: (() => undefined) | undefined,
  deps: Array<any> | null,
  next: Effect,
};

export type BasicStateAction<S> = ((state: S) => S) | S

export type Dispatch<A> = (action: A) => void

/**
 * 这里有一个问题就是
 * 如果 S 范型本身就是一个函数
 * 这里的类型检查没问题， 但是运行时大概率会出现问题
 * TODO: 完善类型检查
 */
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  return typeof action === 'function' ? (action as (state: S) => S)(state) : action;
}

let currentHook: Hook | null = null;
let workInProgressHook: Hook | null = null;
let currentlyRenderingFiber: Fiber | null = null;

export function renderWithHooks(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  props: any
) {
  if (typeof Component !== 'function') {
    throw new Error(`
      Component应该是一个函数
      minreact bug
    `)
  }

  currentlyRenderingFiber = workInProgress;

  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;

  /**
   * 跟context不同，这里不需要使用栈来存储dispatcher
   * dispatcher只有在 *函数组件* 发挥作用
   * 在每次reconlile调和的时候， 只会向下延伸一层
   * 再有每次执行函数组件之前都会判断使用什么dispatcher
   * 所以可以保证ReactCurrentDispatcher.current在每次函数组件的环境中都是正确的
   */
  const currentDispatcher = current === null
    ? HooksDispatcherOnMount
    : current.memoizedState === null
      ? HooksDispatcherOnMount
      : HooksDispatcherOnUpdate
  ReactCurrentDispatcher.current = currentDispatcher;

  let children = Component(props);

  currentlyRenderingFiber = null;

  currentHook = null;
  workInProgressHook = null;

  return children;
}


export function resolveDispatcher(): Dispatcher {
  const dispatcher = ReactCurrentDispatcher.current;

  if (dispatcher === null) {
    throw new Error(`
      ReactCurrentDispatcher.current 不能为空!
    `)
  }

  return dispatcher;
}

function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    queue: null,
    baseState: null,
    baseQueue: null,
    next: null,
  }

  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }

  return hook;

}

function updateWorkInProgressHook(): Hook {
  let nextCurrentHook: Hook | null;

  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate;
    if (current !== null) {
      nextCurrentHook = current.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    nextCurrentHook = currentHook.next;
  }

  if (nextCurrentHook === null) {
    throw new Error(`
      对比上次的渲染 此次的渲染了更多的hooks
      请检查是不是hook放置在了if else、for loop、 while loop当中
    `)
  }

  currentHook = nextCurrentHook;

  const newHook: Hook = {
    memoizedState: currentHook.memoizedState,
    baseState: currentHook.baseState,
    baseQueue: currentHook.baseQueue,
    queue: currentHook.queue,
    next: null
  }

  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
  } else {
    workInProgressHook = workInProgressHook.next = newHook;
  }

  return newHook;

}

function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  const hook = mountWorkInProgressHook();
  if (typeof initialState === 'function') {
    initialState = (initialState as (() => S))();
  }

  hook.memoizedState = initialState;

  const queue: UpdateQueue<S, BasicStateAction<S>> = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
  }
  hook.queue = queue;
  const dispatch = queue.dispatch = dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    queue,
  );

  return [initialState, dispatch];
}

function updateState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  const hook = updateWorkInProgressHook();

  const queue: UpdateQueue<S, BasicStateAction<S>> = hook.queue;

  const reducer = queue.lastRenderedReducer;

  const current = currentHook;
  let baseQueue = current.baseQueue;

  const pending = queue.pending;

  if (pending !== null) {
    if (baseQueue !== null) {
      // 合并baseQueue和pendingQueue
      /**
       * baseQueue:
       * 1 -> 2 -> 3 -> [1] 形成自环
       * pending:
       * 4 -> 5 -> 6 -> [4] 形成自环
       * 
       * baseQueue和pendingQueue分别指向环形链表的最后一个节点(最新的update)
       * 
       * 合并之后:
       * 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> [1]
      */
      const baseFirst = baseQueue.next;
      const pendingFirst = pending.next;
      /**
       * 让baseQueue(之前更新还没有处理的最新的update)的下一个指向pendingFirst(此次更新需要处理的最旧的update)
       */
      baseQueue.next = pendingFirst;
      /**
       * 让pending(此次更新需要处理的最新的update)指向baseFirst(之前更新还没有处理的最旧的update)
       */
      pending.next = baseFirst;
    }
    current.baseQueue = baseQueue = pending;
    // 注意设置为null 防止app随着更新增多导致环形链表不断占用内存
    queue.pending = null;
  }

  if (baseQueue !== null) {
    const first = baseQueue.next;
    let update = first;
    let newBaseState = null;
    let newBaseStateLast: Update<any, any> = null;
    let newBaseStateFirst: Update<any, any> = null;
    let newState = current.baseState;

    do {

      // TODO 根据优先级判断当前update是否执行
      if (/* 优先级不够 */false) {
        const clone: Update<any, any> = {
          action: update.action,
          lane: update.lane,
          next: null,
        };
        if (newBaseStateLast === null) {
          // 从这个update开始 后面所有的update都要加入baseQueue
          newBaseStateFirst = newBaseStateLast = clone;
          // 所以将newBaseState设置为newState
          newBaseState = newState;
        } else {
          newBaseStateLast = newBaseStateLast.next = clone;
        }
      } else {
        // 对于高优先级update直接处理

        if (newBaseStateLast !== null) {
          // 如果之前有没有处理的低优先级update
          // 需要保持从第1个未处理的update到最后一个update的完整
          const clone: Update<any, any> = {
            action: update.action,
            lane: NoLane, // 这里是用NoLane是为了保证下一次更新 这个update不会被跳过
            next: null,
          };
          newBaseStateLast = newBaseStateLast.next = clone;
        }

        newState = reducer(newState, update.action);
        update = update.next;
      }
    } while (update !== null && update !== first);

    if (newBaseStateLast !== null) {
      // 把baseQueue连成环
      newBaseStateLast.next = newBaseStateFirst;
    } else {
      // 没有优先级不够的update 
      // baseState已经是最新的了
      newBaseState = newState;
    }

    hook.memoizedState = newState;
    hook.baseState = newBaseState;
    hook.baseQueue = newBaseStateLast;

    queue.lastRenderedState = newState;
  }

  return [hook.memoizedState, queue.dispatch];
}


function mountEffect(
  create: () => (() => undefined) | undefined,
  deps?: Array<any>
) {
  mountEffectImpl(
    Passive,
    HookPassive,
    create,
    deps
  )
}

function mountEffectImpl(
  fiberFlags: Flags,
  hookFlags: HookFlags,
  create: () => (() => undefined) | undefined,
  deps?: Array<any>
) {
  if (deps === undefined) {
    deps = null;
  }
  const hook = mountWorkInProgressHook();
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushEffect(
    hookFlags | HookHasEffect,
    create,
    undefined,
    deps,
  );
}

function updateEffect(
  create: () => (() => undefined) | undefined,
  deps?: Array<any>
) {
  updateEffectImpl(
    Passive,
    HookPassive,
    create,
    deps,
  );
}

function updateEffectImpl(
  fiberFlags: Flags,
  hookFlags: HookFlags,
  create: () => (() => undefined) | undefined,
  deps?: Array<any>
) {
  const nextDeps = deps === undefined ? null : deps;
  const hook = updateWorkInProgressHook();

  const destroy = (currentHook.memoizedState as Effect).destroy;

  if (nextDeps !== null) {
    // 比较前后deps是否一样
    const prevDeps = (currentHook.memoizedState as Effect).deps;
    const areEqual =
      prevDeps.length === nextDeps.length
      && nextDeps.every((nextDep, index) => nextDep === prevDeps[index]);

    if (areEqual) {
      hook.memoizedState = pushEffect(
        hookFlags,
        create,
        destroy,
        nextDeps
      );
      return;
    }
  }

  // 前后deps不一致
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushEffect(
    hookFlags | HookHasEffect,
    create,
    destroy,
    deps,
  );

}

function pushEffect(
  tag: HookFlags,
  create: (() => (() => undefined) | undefined),
  destroy: (() => undefined) | undefined,
  deps: Array<any> | null,
) {
  const effect: Effect = {
    tag,
    create,
    destroy,
    deps,
    next: null,
  };

  let fucntionComponentUpdateQueue = currentlyRenderingFiber.updateQueue as (FunctionComponentUpdateQueue);
  if (fucntionComponentUpdateQueue === null) {
    currentlyRenderingFiber.updateQueue = fucntionComponentUpdateQueue = {
      lastEffect: null,
    };
    fucntionComponentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = fucntionComponentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      fucntionComponentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      fucntionComponentUpdateQueue.lastEffect = effect;
    }
  }
  return effect;
}

function dispatchSetState<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A,
) {
  const lane = requestUpdateLane(fiber);

  const update: Update<S, A> = {
    action,
    next: null,
    lane
  };
  enqueueUpdate(fiber, queue, update);

  scheduleUpdateOnFiber(fiber, lane);
}


/**
 * queue.pending指向最新的update
 * queue.pending.next指向最旧的update 
 * 4 -> 1 -> 2 -> 3 -> 4 ....
 * 4就是queue.pending
 */
function enqueueUpdate<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  update: Update<S, A>,
) {
  const pending = queue.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;
}


const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
  useEffect: mountEffect,
}

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState,
  useEffect: updateEffect,
}

