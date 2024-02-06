type Transition = {}

type BatchConfig = {
  transition: Transition | null,
}

/**
 * 用来判读是否存在Transition优先级的更新
 */
export const ReactCurrentBatchConfig: BatchConfig = {
  transition: null
};
