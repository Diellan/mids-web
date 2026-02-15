import { createContext, useContext, useMemo } from "react";
import type { DomainStoreApi, DomainStoreState } from "./DomainStore";

export const DomainStoreContext = createContext<DomainStoreApi | null>(null);

/**
 * Returns a stable proxy that routes all method calls to store.getState().
 * This preserves backward compatibility: components can call store.method()
 * exactly as they did with the old class-based DomainStore.
 */
export function useDomainStoreInstance(): DomainStoreState {
  const store = useContext(DomainStoreContext);
  if (!store) {
    throw new Error("DomainStore not available. Did you forget the Provider?");
  }
  return useMemo(() => new Proxy({} as DomainStoreState, {
    get(_target, prop: string) {
      const state = store.getState();
      const value = (state as any)[prop];
      return typeof value === 'function' ? value.bind(state) : value;
    }
  }), [store]);
}
