import { sleep } from '@tests/utils';
import { FiberRoot } from '../ReactInternalTypes';
import { HostRoot } from '../ReactWorkTag';

describe('ReactFiberBeginWork', () => {
  let ReactDom: typeof import('@mini-react/mini-react-dom');
  let Reconciler: typeof import('@mini-react/mini-react-reconciler');
  beforeEach(async () => {
    jest.resetModules();
    ReactDom = await import('@mini-react/mini-react-dom');
    Reconciler = await import('@mini-react/mini-react-reconciler');
  });

  it('beginWork is called in the desired order', async () => {
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
    const fiberRoot = root['_internalRoot'] as FiberRoot;
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