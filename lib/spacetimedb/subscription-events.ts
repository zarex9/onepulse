const listeners = new Set<() => void>();
export const onSubscriptionChange = (callback: () => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const notifySubscriptionApplied = () => {
  for (const callback of listeners) {
    callback();
  }
};
export const notifySubscriptionError = () => {
  for (const callback of listeners) {
    callback();
  }
};

export const cleanupSubscriptionListener = () => {
  listeners.clear();
};
