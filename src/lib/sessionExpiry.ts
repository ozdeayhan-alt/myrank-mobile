type SessionExpiredHandler = () => void;

let handler: SessionExpiredHandler | null = null;
let notifying = false;

export function registerSessionExpiredHandler(fn: SessionExpiredHandler): void {
  handler = fn;
}

export function notifySessionExpired(): void {
  if (notifying || !handler) {
    return;
  }
  notifying = true;
  try {
    handler();
  } finally {
    setTimeout(() => {
      notifying = false;
    }, 10_000);
  }
}
