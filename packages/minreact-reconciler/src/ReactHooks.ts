import { BasicStateAction, Dispatch, resolveDispatcher } from "./ReactFiberHooks";

export function useState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

export function useEffect(
  create: () => (() => undefined | undefined),
  deps?: any[]
) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, deps);
}