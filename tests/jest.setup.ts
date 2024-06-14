if (typeof global.requestIdleCallback !== 'function') {
  global.requestIdleCallback = (callback) => {
    const start = Date.now();
    const timer = setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        }
      });
    }, 1) as unknown as number;
    return timer;
  };

  global.cancelIdleCallback = (id) => {
    clearTimeout(id);
  };
}