import { Dispatcher } from "./ReactInternalTypes"

type CurrentDispatcher = {
  current: null | Dispatcher
}

export const ReactCurrentDispatcher: CurrentDispatcher = {
  current: null
}