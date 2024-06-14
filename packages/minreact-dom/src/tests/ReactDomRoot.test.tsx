jest.mock('@minreact/minreact-reconciler', () => {
  return {
    ...jest.requireActual('@minreact/minreact-reconciler'),
    __esModule: true,
  };
});

import { createRoot } from '../ReactDomRoot';
import * as Reconciler from '@minreact/minreact-reconciler';

describe('ReactDomRoot', () => {
  let updateContainer;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    updateContainer = jest.spyOn(Reconciler, 'updateContainer');
  });

  it('createRoot', () => {
    const divElement = document.createElement('div');
    const domRoom = createRoot(divElement);
    const root = domRoom['_internalRoot'] as Reconciler.FiberRoot;
    expect(root).toBeDefined();
    expect(root.tag).toBe(Reconciler.ConcurrentTag);
    expect(root.containerInfo).toBe(divElement);
    expect(root.current.tag).toBe(Reconciler.HostRoot);
  });

  it('ReactDomRoot.prototype.render', () => {
    const divElement = document.createElement('div');
    const domRoom = createRoot(divElement);
    const reactElement = (
      <div>
        minreact
      </div>
    );
    domRoom.render(reactElement);
    expect(updateContainer).toHaveBeenCalledTimes(1);
  });
});