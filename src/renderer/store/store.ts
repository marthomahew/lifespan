import { useSyncExternalStore } from 'react';

/** A tiny external store: get, set (shallow merge), subscribe. */
export function createStore<T extends object>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: (): T => state,
    set(patch: Partial<T> | ((s: T) => Partial<T>)): void {
      const p = typeof patch === 'function' ? patch(state) : patch;
      state = { ...state, ...p };
      for (const l of listeners) l();
    },
    subscribe(l: () => void): () => void {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

export type Store<T extends object> = ReturnType<typeof createStore<T>>;

export function useStore<T extends object, U>(store: Store<T>, sel: (s: T) => U): U {
  return useSyncExternalStore(
    store.subscribe,
    () => sel(store.get()),
    () => sel(store.get()),
  );
}
