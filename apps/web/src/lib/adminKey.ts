// The admin key (PLAN §7: a shared secret, not a login). Kept in sessionStorage, so it is
// gone when the tab closes. Components subscribe (useSyncExternalStore), so a 401 anywhere
// brings the key prompt back.
const STORAGE_KEY = 'white-lotus-admin-key';
const listeners = new Set<() => void>();
// Set when the API rejected the stored key, so the prompt can say why it came back.
let rejected = false;

export function getAdminKey(): string | null {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setAdminKey(key: string) {
  sessionStorage.setItem(STORAGE_KEY, key);
  rejected = false;
  notify();
}

/** Forget the key. `wasRejected`: the API answered 401, so the prompt explains it. */
export function clearAdminKey(wasRejected = false) {
  sessionStorage.removeItem(STORAGE_KEY);
  rejected = wasRejected;
  notify();
}

export function adminKeyWasRejected(): boolean {
  return rejected;
}

export function subscribeAdminKey(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  for (const listener of listeners) listener();
}
