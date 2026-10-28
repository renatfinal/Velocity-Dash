'use client';

import { useSyncExternalStore, useCallback } from 'react';

const listeners = new Map<string, Set<() => void>>();
const snapshotCache = new Map<string, { raw: string | null; parsed: unknown }>();

function getListeners(key: string) {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  return listeners.get(key)!;
}

function getCachedSnapshot<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    const cached = snapshotCache.get(key);
    if (cached && cached.raw === raw) {
      return cached.parsed as T;
    }
    const parsed = raw !== null ? (JSON.parse(raw) as T) : defaultValue;
    snapshotCache.set(key, { raw, parsed });
    return parsed;
  } catch {
    return defaultValue;
  }
}

export function usePersistentState<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const set = getListeners(key);
      set.add(onStoreChange);

      const onStorage = (e: StorageEvent) => {
        if (e.key === key) onStoreChange();
      };
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', onStorage);
      }

      return () => {
        set.delete(onStoreChange);
        if (typeof window !== 'undefined') {
          window.removeEventListener('storage', onStorage);
        }
      };
    },
    [key]
  );

  const getSnapshot = useCallback((): T => {
    return getCachedSnapshot<T>(key, defaultValue);
  }, [key, defaultValue]);

  const getServerSnapshot = useCallback((): T => {
    return defaultValue;
  }, [defaultValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (valOrUpdater: T | ((prev: T) => T)) => {
      if (typeof window === 'undefined') return;
      try {
        const raw = localStorage.getItem(key);
        const current = raw !== null ? JSON.parse(raw) : defaultValue;
        const next = typeof valOrUpdater === 'function' ? (valOrUpdater as (prev: T) => T)(current) : valOrUpdater;
        const nextRaw = JSON.stringify(next);
        localStorage.setItem(key, nextRaw);
        snapshotCache.set(key, { raw: nextRaw, parsed: next });

        const set = getListeners(key);
        set.forEach((fn) => fn());
      } catch {
        // Ignored
      }
    },
    [key, defaultValue]
  );

  return [value, setValue];
}
