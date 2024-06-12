jest.mock('@mini-react/mini-react-reconciler', () => {
  return {
    ...jest.requireActual('@mini-react/mini-react-reconciler'),
    __esModule: true,
  };
});

import { createRoot } from '../ReactDomRoot';
import * as Reconciler from '@mini-react/mini-react-reconciler';

describe('ReactDomRoot', () => {
  let updateContainer;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
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