import { sleep } from "@tests/utils";
import { scheduleCallback } from "../Scheduler";

describe('Scheduler', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  function createJestFnWithReturnTimes(maxCallbackReturns: number) {
    let currentCallbackReturns = 0;
    const callback = jest.fn(() => {
      currentCallbackReturns++;
      if (currentCallbackReturns <= maxCallbackReturns) {
        return callback;
      }
    })
    return callback;
  }

  function createJestFnWithLongRunning(initBlockTime: number, descPerReturn: number) {
    let blockTime = initBlockTime;
    const callback = jest.fn(() => {
      if (blockTime >= 0) {
        const now = (new Date()).getTime();
        while ((new Date()).getTime() - now < blockTime);
        blockTime -= descPerReturn;
      }
      if (blockTime >= 0) {
        return callback;
      }
    })
    return callback;
  }

  it('scheduleCallback', async () => {
    const firstCallback = createJestFnWithReturnTimes(4);
    const secondCallback = createJestFnWithReturnTimes(9);
    scheduleCallback(firstCallback);
    scheduleCallback(secondCallback);
    await sleep(500);
    expect(firstCallback).toHaveBeenCalledTimes(5);
    expect(secondCallback).toHaveBeenCalledTimes(10);

    const longTimeCallback = createJestFnWithLongRunning(1000, 600);
    // 1000 + 400
    scheduleCallback(longTimeCallback);
    await sleep(1500);
    expect(longTimeCallback).toHaveBeenCalledTimes(2);
  }, 10000);
});
