import { useContext } from "react";
import { useStore } from "zustand";
import type { DomainStoreState } from "./DomainStore";
import { DomainStoreContext } from "./domainStoreContext";

/**
 * React hook to subscribe to the DomainStore and select
 * a derived slice of state.
 *
 * @param selector A pure function that derives data from the store
 */
export function useDomainStore<T>(
  selector: (store: DomainStoreState) => T
): T {
  const store = useContext(DomainStoreContext);
  if (!store) {
    throw new Error("DomainStore not available. Did you forget the Provider?");
  }
  return useStore(store, selector);
}
