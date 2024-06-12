import { peek, pop, push } from "../MinHeap";
import { Task } from "../Scheduler";

describe('Heap', () => {
  let time: number;
  let sameTasks: Array<Task>;
  let tasks: Array<Task>;
  beforeAll(() => {
    time = (new Date()).getTime();
    sameTasks = [{
      id: 1,
      callback: () => { },
      startTime: time + 1,
      expirationTime: time + 1,
      sortIndex: time + 1,
    }, {
      id: 1,
      callback: () => { },
      startTime: time + 1,
      expirationTime: time + 1,
      sortIndex: time + 1,
    },
    {
      id: 1,
      callback: () => { },
      startTime: time + 1,
      expirationTime: time + 1,
      sortIndex: time + 1,
    }];
    tasks = [
      {
        id: 10,
        callback: () => { },
        startTime: time + 10,
        expirationTime: time + 10,
        sortIndex: time + 10,
      },
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
        id: 9,
        callback: () => { },
        startTime: time + 9,
        expirationTime: time + 9,
        sortIndex: time + 9,
      },
      {
        id: 2,
        callback: () => { },
        startTime: time + 2,
        expirationTime: time + 2,
        sortIndex: time + 2,
      },
      {
        id: 8,
        callback: () => { },
        startTime: time + 8,
        expirationTime: time + 8,
        sortIndex: time + 8,
      },
      {
        id: 7,
        callback: () => { },
        startTime: time + 7,
        expirationTime: time + 7,
        sortIndex: time + 7,
      },
      {
        id: 6,
        callback: () => { },
        startTime: time + 6,
        expirationTime: time + 6,
        sortIndex: time + 6,
      },
      {
        id: 4,
        callback: () => { },
        startTime: time + 4,
        expirationTime: time + 4,
        sortIndex: time + 4,
      },
      {
        id: 5,
        callback: () => { },
        startTime: time + 5,
        expirationTime: time + 5,
        sortIndex: time + 5,
      },
      {
        id: 10,
        callback: () => { },
        startTime: time + 10,
        expirationTime: time + 10,
        sortIndex: time + 10,
      },
      {
        id: 10,
        callback: () => { },
        startTime: time + 10,
        expirationTime: time + 10,
        sortIndex: time + 10,
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