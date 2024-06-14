import { getFiberRoot } from '@minreact/minreact-dom';
import { sleep } from '@tests/utils';
import { useState } from 'react';
import { BasicStateAction, Hook, UpdateQueue } from '../ReactFiberHooks';

describe('useStateTest', () => {
  let ReactDom: typeof import('@minreact/minreact-dom');
  let Reconciler: typeof import('@minreact/minreact-reconciler');
  beforeEach(async () => {
    jest.resetModules();
    ReactDom = await import('@minreact/minreact-dom');
    Reconciler = await import('@minreact/minreact-reconciler');
  });

  it('useState init', async () => {
    const rootElement = document.createElement('div');
    const root = ReactDom.createRoot(rootElement);
    function App() {
      Reconciler.useState(0);
      Reconciler.useState(7);
      return (
        <div id='app'></div>
      )
    }
    root.render(<App />);
    await sleep(50);
    const appFiber = getFiberRoot(root).current.child;
    const hook = appFiber.memoizedState as Hook;
    expect(hook.memoizedState).toBe(0);
    expect(hook.next.memoizedState).toBe(7);
    expect(hook.next.next).toBeNull();
  })

  it('useState update', async () => {
    const rootElement = document.createElement('div');
    const root = ReactDom.createRoot(rootElement);
    let setCount;
    function App() {
      setCount = Reconciler.useState(0)[1];
      return (
        <div id='app'></div>
      )
    }
    root.render(<App />);
    await sleep(50);
    // update count
    setCount(1);
    setCount(4);
    let queue: UpdateQueue<number, BasicStateAction<number>> = (
      getFiberRoot(root)
        .current
        .child
        .memoizedState as Hook
      )
      .queue;
    const pending = queue.pending;
    expect(pending.next.action).toBe(1); // first
    expect(pending.next.next.action).toBe(4); // second
    expect(pending).toBe(pending.next.next); // circle linked list

    await sleep(50);
    const appFiber = getFiberRoot(root).current.child;
    const hook = appFiber.memoizedState as Hook;
    queue = (
      getFiberRoot(root)
        .current
        .child
        .memoizedState as Hook
      )
      .queue;
    expect(hook.memoizedState).toBe(4);
    expect(hook.next).toBeNull();
    expect(queue.pending).toBeNull();
  });
})