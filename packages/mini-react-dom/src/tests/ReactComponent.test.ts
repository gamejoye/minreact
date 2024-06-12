import { 
  createInstance,
  createTextInstance, 
  diffProperties,
  getFiberCurrentPropsFromNode,
  setInitialDOMProperties,
  updateDOMProperties,
  updateFiberProps
} from '../ReactComponent';

describe('React Component', () => {
  let Reconciler;
  beforeEach(() => {
    jest.resetModules();
    Reconciler = require('@mini-react/mini-react-reconciler');
  });

  it('should createInstance set internalKey', () => {
    const props = {
      age: 20,
      name: 'gamejoye',
    };
    const fiber = Reconciler.createFiber(Reconciler.ConcurrentTag, props, null);
    const instantce = createInstance(
      'div',
      props,
      fiber
    );
    expect(instantce.nodeName).toBe('DIV');
    expect(getFiberCurrentPropsFromNode(instantce)).toMatchObject(props);
  });

  it('should createTextInstance correctly', () => {
    const textInstance = createTextInstance('hello world');
    expect(textInstance.nodeValue).toBe('hello world');
  });

  it('updateFiberProps work correctly', () => {
    const props = {
      key1: 'value1',
      key2: 'value2',
    }
    const fiber = Reconciler.createFiber(Reconciler.ConcurrentTag, props, null);
    const instantce = createInstance(
      'div',
      props,
      fiber
    );
    updateFiberProps(instantce, props);
    expect(getFiberCurrentPropsFromNode(instantce)).toMatchObject(props);

    const newProps = {
      newKey1: 'newValue1',
    };
    updateFiberProps(instantce, newProps);
    expect(getFiberCurrentPropsFromNode(instantce)).toMatchObject(newProps);
  });

  it('setInitialDOMProperties work correctly', () => {
    const onClick = jest.fn();
    const props = {
      age: 20,
      testKey: 'testkey',
      onClick,
    };
    const clickEvent = new Event('click');

    const fiber = Reconciler.createFiber(Reconciler.ConcurrentTag, props, null);
    const divElement = createInstance(
      'div',
      props,
      fiber
    );
    divElement.dispatchEvent(clickEvent);
    expect(onClick).toHaveBeenCalledTimes(0);

    setInitialDOMProperties(
      divElement,
      'div',
      props
    );
    expect(divElement['testKey']).toBe('testkey');
    divElement.dispatchEvent(clickEvent);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('diffProperties should return newProps update', () => {
    const props = {
      age: 20,
    };
    const fiber = Reconciler.createFiber(Reconciler.ConcurrentTag, props, null);
    const instance = createInstance(
      'div',
      props,
      fiber
    );
    const newProps = {
      age: 21,
    };
    const updateQueue = diffProperties(
      instance,
      'div',
      props,
      newProps,
    );
    expect(updateQueue).not.toBeNull();
    expect(updateQueue).toMatchObject([['age', 21]]);
  })

  it('diffProperties should return null when props have not changed', () => {
    const props = {
      age: 20,
    };
    const fiber = Reconciler.createFiber(Reconciler.ConcurrentTag, props, null);
    const instance = createInstance(
      'div',
      props,
      fiber
    );
    const newProps = {
      age: 20,
    };
    const updateQueue = diffProperties(
      instance,
      'div',
      props,
      newProps,
    );
    expect(updateQueue).toBeNull();
  })

  it('updateDOMProperties and diffProperties work correctly', () => {
    const oldOnClick = jest.fn();
    const props = {
      age: 20,
      testKey: 'gamejoye',
      keyOnlyInOld: 'keyOnlyInOldvalue',
      constKey: 'constKey',
      onClick: oldOnClick,
    };
    const fiber = Reconciler.createFiber(Reconciler.ConcurrentTag, props, null);
    const divElement = createInstance(
      'div',
      props,
      fiber
    );
    setInitialDOMProperties(
      divElement,
      'div',
      props
    );

    const newOnClick = jest.fn();
    const newOnChange = jest.fn();
    const newProps = {
      testKey: 'newTestKey',
      age: 21,
      keyOnlyInNew: 'keyOnlyInNew',
      constKey: 'constKey',
      onClick: newOnClick,
      onChange: newOnChange,
    };
    const clickEvent = new Event('click');
    const changeEvent = new Event('change');

    divElement.dispatchEvent(clickEvent);
    expect(oldOnClick).toHaveBeenCalledTimes(1);

    const updateQueue = diffProperties(
      divElement,
      'div',
      props,
      newProps,
    );
    expect(updateQueue.length).toBeGreaterThan(0);
    expect(updateQueue).toContainEqual(['keyOnlyInOld', null]);
    expect(updateQueue).not.toContainEqual(['constKey', expect.anything()]);
    expect(updateQueue).toContainEqual(['keyOnlyInNew', 'keyOnlyInNew']);
    expect(updateQueue).toContainEqual(['testKey', 'newTestKey']);
    expect(updateQueue).toContainEqual(['onClick', null]);
    expect(updateQueue).toContainEqual(['onClick', newOnClick]);
    expect(updateQueue).toContainEqual(['onChange', newOnChange]);

    updateDOMProperties(
      divElement,
      updateQueue
    );
    expect(divElement['testKey']).toBe('newTestKey');
    expect(divElement['age']).toBe(21);
    divElement.dispatchEvent(clickEvent);
    divElement.dispatchEvent(changeEvent);
    expect(oldOnClick).toHaveBeenCalledTimes(1);
    expect(newOnClick).toHaveBeenCalledTimes(1);
    expect(newOnChange).toHaveBeenCalledTimes(1);
  });
});