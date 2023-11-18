import { FiberRoot } from "../../mini-react-reconciler/src/ReactInternalTypes";

export type ReactElement = {
  type: any,
  props: {
    children: string | ReactElement[],
  }
};

export type ReactDomRoot = {
  render: (children: ReactElement) => void,
};