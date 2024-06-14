import { ReactElement } from "react";

export type ReactDomRoot = {
  render: (children: ReactElement) => void,
};