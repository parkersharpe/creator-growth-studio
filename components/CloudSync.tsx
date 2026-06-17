'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';

// Logical keys persisted to the cloud (must match ALLOWED_KEYS in /api/data)
const SYNC_KEYS = [
  'cgs_profile',
  'cgs_voice',
  'cgs_quotes',
  'cgs_saved',
  'cgs_kits',
  'cgs_design',
  'cgs_machine_content',
  'cgs_machine_type',
  'cgs_theme',
];

// Profile/voice are also mirrored to user-scoped keys for the auth guards
const USER_SCOPED = ['cgs_profile', 'cgs_voice'];

// Append-only collections — never let a stale cloud copy delete items the user just added.
// On load these are merged (union by id) instead of clobbered.
const COLLECTION_KEYS = ['cgs_saved', 'cgs_kits'];

function mergeCollections(localRaw: string | null, cloudRaw: string | null): string {
  try {
    const local = localRaw ? JSON.parse(localRaw) : [];
    const cloud = cloudRaw ? JSON.parse(cloudRaw) : [];
    if (!Array.isArray(local) || !Array.isArray(cloud)) return (localRaw || cloudRaw) ?? '[]';
    const byId = new Map<string, unknown>();
    // Cloud first, then local — local wins on matching id (reflects latest edits)
    for (const item of cloud) byId.set(idOf(item), item);
    for (const item of local) byId.set(idOf(item), item);
    const merged = Array.from(byId.values());
    merged.sort((a, b) => (savedAt(b) - savedAt(a)));
    return JSON.stringify(merged);
  } catch {
    return (localRaw || cloudRaw) ?? '[]';
  }
}

// Per-key "dirty" flags. A key is marked dirty the moment it's edited locally and
// stays dirty until its upload is CONFIRMED by the server. On load, a dirty key is
// never overwritten by the cloud — this protects a freshly uploaded profile photo
// (or any edit) whose upload was dropped. Crucially this uses no timestamps, so it
// can't be fooled by client/server clock skew (the old timestamp approach could).
const DIRTY_PREFIX = 'cgs_dirty_';
function isDirty(key: string): boolean {
  try { return localStorage.getItem(DIRTY_PREFIX + key) === '1'; } catch { return false; }
}
function markDirty(key: string) {
  try { localStorage.setItem(DIRTY_PREFIX + key, '1'); } catch {}
}
function clearDirty(key: string) {
  try { localStorage.removeItem(DIRTY_PREFIX + key); } catch {}
}

function idOf(item: unknown): string {
  if (item && typeof item === 'object' && 'id' in item) return String((item as { id: unknown }).id);
  return JSON.stringify(item);
}
function savedAt(item: unknown): number {
  if (item && typeof item === 'object' && 'savedAt' in item) {
    const v = (item as { savedAt: unknown }).savedAt;
    return typeof v === 'number' ? v : 0;
  }
  return 0;
}

export default function CloudSync({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [hydrated, setHydrated] = useState(false);
  const hydratedFor = useRef<string | null>(null);
  const pending = useRef<Record<string, string>>({});
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interceptorInstalled = useRef(false);

  // Send any queued changes to the cloud now. keepalive lets the request survive
  // a page being backgrounded or closed (the common "save then leave" case on mobile).
  // On a confirmed (non-unload) success we clear the dirty flags so the cloud may win
  // freely next load. On unload we can't read the response, so flags stay dirty and the
  // value is simply re-uploaded next time (idempotent) — never lost.
  function flushNow(viaUnload = false) {
    if (flushTimer.current) { clearTimeout(flushTimer.current); flushTimer.current = null; }
    const entries = pending.current;
    const keys = Object.keys(entries);
    if (keys.length === 0) return;
    pending.current = {};
    try {
      const p = fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
        keepalive: viaUnload,
      });
      if (!viaUnload) {
        p.then(res => { if (res.ok) for (const k of keys) clearDirty(k); }).catch(() => {});
      } else {
        p.catch(() => {});
      }
    } catch {}
  }

  // Flush whenever the tab is hidden or the page is being torn down, so timers
  // frozen by the OS can't swallow a pending save.
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') flushNow(true); };
    const onPageHide = () => flushNow(true);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { setHydrated(true); return; }
    const uid = user.id;
    if (hydratedFor.current === uid) return;

    // Map a raw localStorage key to its cloud key (or null if not synced)
    function logicalKey(rawKey: string): string | null {
      for (const k of USER_SCOPED) {
        if (rawKey === `${k}_${uid}`) return k;
      }
      return SYNC_KEYS.includes(rawKey) ? rawKey : null;
    }

    function queueUpload(key: string, value: string) {
      markDirty(key); // unconfirmed local change — protect it on next load
      pending.current[key] = value;
      if (flushTimer.current) clearTimeout(flushTimer.current);
      // Short coalescing window — long enough to batch slider drags, short enough
      // that a quick save→reload still lands. Backgrounding is covered by flushNow().
      flushTimer.current = setTimeout(() => flushNow(false), 500);
    }

    function installInterceptor() {
      if (interceptorInstalled.current) return;
      interceptorInstalled.current = true;
      const original = localStorage.setItem.bind(localStorage);
      localStorage.setItem = (rawKey: string, value: string) => {
        original(rawKey, value);
        const key = logicalKey(rawKey);
        if (key) queueUpload(key, value);
      };
    }

    async function hydrate() {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const { data } = await res.json() as {
            data: Record<string, string>;
          };
          const ownsDevice = !!localStorage.getItem(`cgs_profile_${uid}`);
          const toUpload: Record<string, string> = {};

          for (const key of SYNC_KEYS) {
            const serverVal = data[key];

            if (COLLECTION_KEYS.includes(key)) {
              // Union local + cloud so a save is never lost, even if it never uploaded
              const localVal = localStorage.getItem(key);
              if (serverVal === undefined && !localVal) continue;
              const merged = mergeCollections(localVal, serverVal ?? null);
              localStorage.setItem(key, merged);
              if (merged !== serverVal) toUpload[key] = merged; // converge the cloud
              continue;
            }

            if (serverVal !== undefined) {
              const localVal = USER_SCOPED.includes(key)
                ? localStorage.getItem(`${key}_${uid}`) || localStorage.getItem(key)
                : localStorage.getItem(key);

              if (localVal && localVal !== serverVal && isDirty(key)) {
                // Local change hasn't been confirmed-synced yet — keep it and re-upload.
                // Never let the cloud clobber an unsynced local edit (e.g. a new photo).
                localStorage.setItem(key, localVal);
                if (USER_SCOPED.includes(key)) localStorage.setItem(`${key}_${uid}`, localVal);
                toUpload[key] = localVal;
              } else {
                // Cloud is authoritative — take it and clear any stale dirty flag
                localStorage.setItem(key, serverVal);
                if (USER_SCOPED.includes(key)) localStorage.setItem(`${key}_${uid}`, serverVal);
                clearDirty(key);
              }
            } else if (ownsDevice) {
              const localVal = USER_SCOPED.includes(key)
                ? localStorage.getItem(`${key}_${uid}`) || localStorage.getItem(key)
                : localStorage.getItem(key);
              if (localVal) toUpload[key] = localVal;
            }
          }

          if (Object.keys(toUpload).length > 0) {
            fetch('/api/data', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ entries: toUpload }),
            }).catch(() => {});
          }
        }
      } catch {
        // Storage unreachable — fall back to device-local data
      }
      installInterceptor();
      hydratedFor.current = uid;
      setHydrated(true);
    }

    hydrate();
  }, [isLoaded, user]);

  if (!hydrated) return <div style={{ minHeight: '100vh' }} />;
  return <>{children}</>;
}
