import { requestUpdateLane, scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import { ReactCurrentDispatcher } from "./ReactDispatcher";
import { Flags, Passive } from "./ReactFiberFlag";
import { Lane } from "./ReactFiberLane";
import { HookFlags, HookHasEffect, HookPassive } from "./ReactHookFlag";
import { Dispatcher, Fiber } from "./ReactInternalTypes";


export type Update<S, A> = {
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
      mini-react bug
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
    next: null
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
  const state = queue.lastRenderedState;

  const pending = queue.pending;

  if (pending !== null) {
    const first = pending.next;
    let update = first;
    let newState = state;

    do {
      newState = reducer(state, update.action);
      update = update.next;
    } while (update !== null && update !== first);

    hook.memoizedState = newState;
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

    if(areEqual) {
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
    undefined,
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
  if(fucntionComponentUpdateQueue === null) {
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

