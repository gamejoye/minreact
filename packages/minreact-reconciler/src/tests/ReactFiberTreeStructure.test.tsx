import { sleep } from '@tests/utils';
import { FiberRoot } from '../ReactInternalTypes';
import { HostRoot } from '../ReactWorkTag';
import { getFiberRoot } from '@minreact/minreact-dom';

describe('ReactFiberTreeStructure.test', () => {
  let ReactDom: typeof import('@minreact/minreact-dom');
  let Reconciler: typeof import('@minreact/minreact-reconciler');
  beforeEach(async () => {
    jest.resetModules();
    ReactDom = await import('@minreact/minreact-dom');
    Reconciler = await import('@minreact/minreact-reconciler');
  });

  it('fiberTreeShouldBeCorrectAfterCommit', async () => {
    const rootElement = document.createElement('div');
    const root = ReactDom.createRoot(rootElement);
    function App() {
      return (
        <div id='app'>
          <p>pp</p>
          <span>spann</span>
        </div>
      )
    }

    root.render(<App />);
    await sleep(50);
    const fiberRoot = getFiberRoot(root);
    const hostFiberRoot = fiberRoot.current;
    const appFiber = hostFiberRoot.child;
    const divFiber = appFiber.child;
    const pFiber = divFiber.child;
    const spanFiber = pFiber.sibling;
    const pTextFiber = pFiber.child;
    const spanTextFiber = spanFiber.child;
    expect(hostFiberRoot.tag).toBe(HostRoot);
    expect(appFiber.type).toBe(App);
    expect(appFiber.return).toBe(hostFiberRoot);
    expect(divFiber.type).toBe('div');
    expect(divFiber.return).toBe(appFiber);
    expect(pFiber.type).toBe('p');
    expect(pFiber.return).toBe(divFiber);
    expect(spanFiber.type).toBe('span');
    expect(spanFiber.return).toBe(divFiber);
    expect(pTextFiber.type).toBe('#text');
    expect(pTextFiber.return).toBe(pFiber);
    expect(pTextFiber.memoizedProps).toBe('pp');
    expect(spanTextFiber.type).toBe('#text');
    expect(spanTextFiber.return).toBe(spanFiber);
    expect(spanTextFiber.memoizedProps).toBe('spann');
  })
})