import { peek, pop, push } from "../MinHeap";
import { Task } from "../Scheduler";

describe('Heap', () => {
  let time: number;
  let tasks: Array<Task>;
  beforeAll(() => {
    time = (new Date()).getTime();
    tasks = [
      {
        id: 1,
        callback: () => { },
        startTime: time + 1,
        expirationTime: time + 1,
        sortIndex: time + 1,
      },
      {
        id: 3,
        callback: () => { },
        startTime: time + 3,
        expirationTime: time + 3,
        sortIndex: time + 3,
      },
      {
        id: 2,
        callback: () => { },
        startTime: time + 2,
        expirationTime: time + 2,
        sortIndex: time + 2,
      },
    ];
  })
  it('heap work correctly', () => {
    const heap: Array<Task> = [];
    for (let i = 0; i < tasks.length; i++) push(heap, tasks[i]);
    const tasksFromHeap: Array<Task> = [];
    for (let i = 0; i < tasks.length; i++) {
      const peekTop = peek(heap);
      const popTop = pop(heap);
      expect(popTop).toMatchObject(peekTop);
      tasksFromHeap.push(popTop);
    }
    for (let i = 0; i < tasksFromHeap.length - 1; i++) {
      const prevTask = tasksFromHeap[i];
      const nextTask = tasksFromHeap[i + 1];
      expect(prevTask.sortIndex).toBeLessThanOrEqual(nextTask.sortIndex);
    }

    const peekTop = peek(heap);
    const popTop = pop(heap);
    expect(peekTop).toBeNull();
    expect(popTop).toBeNull();
  });
});