import { createContext, useContext } from "react";
import type { DomainStore } from "./DomainStore";

// The context holds either a DomainStore or null (before boot)
export const DomainStoreContext = createContext<DomainStore | null>(null);

// Small helper hook so components don't touch useContext directly
export function useDomainStoreInstance(): DomainStore {
  const store = useContext(DomainStoreContext);
  if (!store) {
    throw new Error("DomainStore not available. Did you forget the Provider?");
  }
  return store;
}
