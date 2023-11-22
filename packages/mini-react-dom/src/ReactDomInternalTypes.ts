import { ReactElement } from "react";
import { FiberRoot } from "../../mini-react-reconciler/src/ReactInternalTypes";

export type ReactDomRoot = {
  render: (children: ReactElement) => void,
};