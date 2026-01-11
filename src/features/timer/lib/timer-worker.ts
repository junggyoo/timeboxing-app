const workerCode = `
  const timers = new Map();
  let intervalId = null;

  function tick() {
    timers.forEach((t, id) => {
      if (t.status !== 'running') return;

      const now = Date.now();
      const elapsed = now - t.startEpoch - t.pausedMs;
      const remaining = t.durationMs - elapsed;
      const isOvertime = remaining < 0;
      const progress = isOvertime ? 1 : Math.min(1, elapsed / t.durationMs);

      self.postMessage({
        type: 'TICK',
        payload: {
          id,
          remainingMs: Math.abs(remaining),
          elapsedMs: elapsed,
          progress,
          isOvertime
        }
      });

      if (remaining <= 0 && !t.hasNotifiedTimeUp) {
        t.hasNotifiedTimeUp = true;
        self.postMessage({ type: 'TIME_UP', payload: { id } });
      }
    });
  }

  self.onmessage = (e) => {
    const { type, payload } = e.data;

    switch (type) {
      case 'START':
        timers.set(payload.id, {
          durationMs: payload.durationMs,
          startEpoch: Date.now(),
          pausedMs: 0,
          status: 'running',
          hasNotifiedTimeUp: false,
        });
        if (!intervalId) {
          intervalId = setInterval(tick, 250);
        }
        tick();
        break;

      case 'PAUSE': {
        const timer = timers.get(payload.id);
        if (timer) {
          timer.pauseStartEpoch = Date.now();
          timer.status = 'paused';
        }
        break;
      }

      case 'RESUME': {
        const timer = timers.get(payload.id);
        if (timer && timer.pauseStartEpoch) {
          timer.pausedMs += Date.now() - timer.pauseStartEpoch;
          timer.pauseStartEpoch = null;
          timer.status = 'running';
        }
        break;
      }

      case 'STOP': {
        const timer = timers.get(payload.id);
        if (timer) {
          let elapsed;
          if (timer.status === 'paused' && timer.pauseStartEpoch) {
            elapsed = timer.pauseStartEpoch - timer.startEpoch - timer.pausedMs;
          } else {
            elapsed = Date.now() - timer.startEpoch - timer.pausedMs;
          }
          self.postMessage({
            type: 'STOPPED',
            payload: { id: payload.id, elapsedMs: elapsed }
          });
          timers.delete(payload.id);
        }
        if (timers.size === 0 && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        break;
      }

      case 'RESTORE': {
        const now = Date.now();
        let pausedMs = payload.pausedMs;
        let pauseStartEpoch = null;

        if (payload.status === 'paused') {
          pauseStartEpoch = now;
        }

        timers.set(payload.id, {
          durationMs: payload.durationMs,
          startEpoch: payload.startEpoch,
          pausedMs,
          pauseStartEpoch,
          status: payload.status,
          hasNotifiedTimeUp: false,
        });

        if (!intervalId) {
          intervalId = setInterval(tick, 250);
        }
        tick();
        break;
      }
    }
  };
`;

let workerInstance: Worker | null = null;

export function createTimerWorker(): Worker {
  if (typeof window === "undefined") {
    throw new Error("Cannot create worker in non-browser environment");
  }

  if (workerInstance) {
    return workerInstance;
  }

  const blob = new Blob([workerCode], { type: "application/javascript" });
  workerInstance = new Worker(URL.createObjectURL(blob));

  return workerInstance;
}

export function getTimerWorker(): Worker | null {
  return workerInstance;
}

export function terminateTimerWorker(): void {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
}
