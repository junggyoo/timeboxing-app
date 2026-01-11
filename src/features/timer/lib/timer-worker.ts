const workerCode = `
  const timers = new Map();
  const alarms = new Map();  // id -> { type, triggerEpoch, timeboxId, timeboxTitle, hasTriggered }
  let breakTimer = null;     // { id, startEpoch, durationMs, status, hasEnded }
  let intervalId = null;

  function tick() {
    const now = Date.now();

    // Process focus timers
    timers.forEach((t, id) => {
      if (t.status !== 'running') return;

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

    // Process scheduled alarms
    alarms.forEach((alarm, id) => {
      if (alarm.hasTriggered) return;
      if (now >= alarm.triggerEpoch) {
        alarm.hasTriggered = true;
        self.postMessage({
          type: alarm.type,
          payload: {
            id: alarm.id,
            timeboxId: alarm.timeboxId,
            timeboxTitle: alarm.timeboxTitle
          }
        });
      }
    });

    // Process break timer
    if (breakTimer && breakTimer.status === 'running') {
      const elapsed = now - breakTimer.startEpoch;
      const remaining = breakTimer.durationMs - elapsed;
      const progress = Math.min(1, elapsed / breakTimer.durationMs);

      self.postMessage({
        type: 'BREAK_TICK',
        payload: {
          remainingMs: Math.max(0, remaining),
          progress
        }
      });

      if (remaining <= 0 && !breakTimer.hasEnded) {
        breakTimer.hasEnded = true;
        self.postMessage({ type: 'ALARM_BREAK_END', payload: { id: breakTimer.id } });
      }
    }
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

      // Alarm scheduling commands
      case 'SCHEDULE_ALARM': {
        alarms.set(payload.id, {
          id: payload.id,
          type: payload.type,
          triggerEpoch: payload.triggerEpoch,
          timeboxId: payload.timeboxId,
          timeboxTitle: payload.timeboxTitle,
          hasTriggered: false
        });
        // Ensure interval is running for alarm checking
        if (!intervalId) {
          intervalId = setInterval(tick, 250);
        }
        break;
      }

      case 'CANCEL_ALARM': {
        alarms.delete(payload.id);
        break;
      }

      // Break mode commands
      case 'START_BREAK': {
        breakTimer = {
          id: payload.id,
          durationMs: payload.durationMs,
          startEpoch: Date.now(),
          status: 'running',
          hasEnded: false
        };
        // Ensure interval is running for break timer
        if (!intervalId) {
          intervalId = setInterval(tick, 250);
        }
        tick();
        break;
      }

      case 'SKIP_BREAK': {
        breakTimer = null;
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
