import { BasicStateAction, Dispatch, resolveDispatcher } from "./ReactFiberHooks";

export function useState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}