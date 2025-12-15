import { useSyncExternalStore } from "react";
import type { DomainStore } from "./DomainStore";
import { useDomainStoreInstance } from "./domainStoreContext";

/**
 * React hook to subscribe to the DomainStore and select
 * a derived slice of state.
 *
 * @param selector A pure function that derives data from the store
 */
export function useDomainStore<T>(
  selector: (store: DomainStore) => T
): T {
  const store = useDomainStoreInstance();

  return useSyncExternalStore(
    // Subscribe: called once, returns unsubscribe
    (onStoreChange) => store.subscribe(onStoreChange),

    // Snapshot: return current selected value
    () => selector(store)
  );
}
