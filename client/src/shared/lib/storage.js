/**
 * Safe `localStorage` access.
 *
 * Browsers throw when storage is disabled (private mode, blocked cookies,
 * embedded webviews). Every read and write is guarded so a storage failure can
 * never prevent the app from rendering.
 */

export function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
