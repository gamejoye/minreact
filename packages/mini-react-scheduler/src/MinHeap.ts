import { Task } from "./Scheduler";

/**
 * 最小堆的实现
 * 根据sortIndex排序
 * 数值越小优先级越高
 */

type Heap = Array<Task>;

export function peek(heap: Heap) {
  return heap.length === 0 ? null : heap[0];
}

export function pop(heap: Heap) {
  if (heap.length === 0) {
    return null;
  }
  const top = heap[0];
  const tail = heap.pop();
  if (top !== tail) {
    heap[0] = tail;
    shiftDown(heap);
  }
  return top;
}

export function push(heap: Heap, task: Task) {
  heap.push(task);
  shiftUp(heap);
}

function shiftDown(heap: Heap) {
  const length = heap.length;
  let k = 0;
  while (2 * k + 1 < length) {
    const leftChild = 2 * k + 1;
    const rightChild = 2 * k + 2;

    let minChild = leftChild;
    if (rightChild < length && compare(heap[rightChild], heap[leftChild]) < 0) {
      minChild = rightChild;
    }

    if (compare(heap[k], heap[minChild]) < 0) {
      break;
    }

    swap(heap, k, minChild);
    k = minChild;
  }
}

function shiftUp(heap: Heap) {
  let k = heap.length - 1;
  while (k > 0) {
    const parent = k >> 1;

    if (compare(heap[parent], heap[k]) < 0) {
      break;
    }

    swap(heap, k, parent);
    k = parent;
  }
}

function swap(heap: Heap, a: number, b: number) {
  const tmp = heap[a];
  heap[a] = heap[b];
  heap[b] = tmp;
}

function compare(a: Task, b: Task) {
  const diff = a.sortIndex - b.sortIndex;
  return diff === 0 ? a.id - b.id : diff;
}