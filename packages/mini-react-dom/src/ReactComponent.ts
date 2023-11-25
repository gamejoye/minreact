import { Fiber, HostText } from "@mini-react/mini-react-reconciler";
import { internalKey } from "./ReactDomRoot";

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

