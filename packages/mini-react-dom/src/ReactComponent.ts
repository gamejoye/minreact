import { Fiber, HostText } from "@mini-react/mini-react-reconciler";
import { internalKey } from "./ReactDomRoot";

const CHILDREN = 'children';


export function getFiberCurrentPropsFromNode(node: Element) {
  return node[internalKey] || null;
}

export function createInstance(
  type: string,
  props: any,
  workInProgress: Fiber
): Element {
  const domElement = document.createElement(type);
  domElement[internalKey] = props;
  return domElement;
}

export function createTextInstance(
  text: string
): Text {
  const textElement = document.createTextNode(text);
  return textElement;
}


export function diffProperties(
  domElement: Element,
  type: string,
  oldProps: any,
  newProps: any
): null | Array<[string, any]> {
  let updateQueue: null | Array<[string, any]> = null;

  for (const key in oldProps) {
    if (newProps.hasOwnProperty(key)
      || !oldProps.hasOwnProperty(key)
      || key === CHILDREN) {
      continue;
    }

    if (updateQueue === null) updateQueue = [];
    updateQueue.push([key, oldProps[key]]);
  }

  for (const key in newProps) {
    const newProp = newProps[key];
    const oldProp = oldProps[key];
    if (!newProps.hasOwnProperty(key)
      || newProp === oldProp
      || key === CHILDREN) {
      continue;
    }

    if (updateQueue === null) updateQueue = [];
    updateQueue.push([key, newProp]);
  }

  return updateQueue;
}

export function setInitialDOMProperties(
  instance: Element,
  type: string,
  props: any,
) {
  const keys = Object.getOwnPropertyNames(props);
  const eventKeys = keys.filter(isEvent);
  const propertyKeys = keys.filter(isProperty);

  for (const eventKey of eventKeys) {
    instance.addEventListener(
      eventKey.toLocaleLowerCase().substring(2),
      props[eventKey]
    );
  }

  for (const propertyKey of propertyKeys) {
    instance[propertyKey] = props[propertyKey];
  }
}


export function updateDOMProperties(
  instance: Element,
  updateQueue: Array<[string, any]>
) {
  for (const [key, value] of updateQueue) {
    if (isEvent(key)) {
      const eventName = key.toLocaleLowerCase().substring(2);

      const prevProps = getFiberCurrentPropsFromNode(instance);
      const prevValue = prevProps ? prevProps[key] : null;

      if (eventName.length > 0 && typeof prevValue === 'function') {
        instance.removeEventListener(eventName, prevValue);
      }
      if (eventName.length > 0 && typeof value === 'function') {
        instance.addEventListener(eventName, value);
      }
    } else {
      instance[key] = value;
    }
  }
}

export function updateFiberProps(
  instance: Element,
  props: any
) {
  instance[internalKey] = props;
}


export const isEvent = (key: string) => key.startsWith('on');
export const isProperty = (key: string) => key !== CHILDREN && !isEvent(key);
export const isGone = (prev: any, next: any) => (key: string) => Object.getOwnPropertyNames(prev).findIndex(ownKey => ownKey === key) === -1
export const isNew = (prev: any, next: any) => (key: string) => prev[key] !== next[key];

/**
 * 
 * // 移除不存在新props里的事件
  Object
    .getOwnPropertyNames(oldProps)
    .filter(isEvent)
    .filter(isGone(oldProps, newProps))
    .forEach(key => {
      domElement.removeEventListener(
        key.toLocaleLowerCase().substring(2),
        oldProps[key]
      );
    });

  // 移除不存在新props里的属性
  Object
    .getOwnPropertyNames(oldProps)
    .filter(isProperty)
    .filter(isGone(oldProps, newProps))
    .forEach(key => {
      domElement[key] = '';
    });

  // 新增属性
  Object
    .getOwnPropertyNames(newProps)
    .filter(isProperty)
    .filter(isNew(oldProps, newProps))
    .forEach(key => {
      domElement[key] = newProps[key];
    })

  // 新增事件
  Object
    .getOwnPropertyNames(newProps)
    .filter(isEvent)
    .filter(isNew(oldProps, newProps))
    .forEach(key => {
      domElement.addEventListener(
        key.toLocaleLowerCase().substring(2),
        newProps[key]
      );
    })
 */