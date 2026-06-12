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

export default function CloudSync({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [hydrated, setHydrated] = useState(false);
  const hydratedFor = useRef<string | null>(null);
  const pending = useRef<Record<string, string>>({});
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interceptorInstalled = useRef(false);

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
      pending.current[key] = value;
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(() => {
        const entries = pending.current;
        pending.current = {};
        fetch('/api/data', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries }),
          keepalive: true,
        }).catch(() => {});
      }, 1200);
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
          const { data } = await res.json() as { data: Record<string, string> };
          // Only treat local data as this user's if their scoped profile exists here
          const ownsDevice = !!localStorage.getItem(`cgs_profile_${uid}`);
          const toMigrate: Record<string, string> = {};

          for (const key of SYNC_KEYS) {
            const serverVal = data[key];
            if (serverVal !== undefined) {
              // Cloud is the source of truth on load
              localStorage.setItem(key, serverVal);
              if (USER_SCOPED.includes(key)) localStorage.setItem(`${key}_${uid}`, serverVal);
            } else if (ownsDevice) {
              const localVal = USER_SCOPED.includes(key)
                ? localStorage.getItem(`${key}_${uid}`) || localStorage.getItem(key)
                : localStorage.getItem(key);
              if (localVal) toMigrate[key] = localVal;
            }
          }

          if (Object.keys(toMigrate).length > 0) {
            fetch('/api/data', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ entries: toMigrate }),
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
