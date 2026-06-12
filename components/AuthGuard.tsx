'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.replace('/sign-in'); return; }
    const uid = user.id;
    // Strictly user-scoped — never fall back to another user's profile
    const profile = localStorage.getItem(`cgs_profile_${uid}`);
    if (!profile) { router.replace('/onboarding'); return; }
    // Sync device-wide keys to the signed-in user before the page reads them
    localStorage.setItem('cgs_profile', profile);
    const voice = localStorage.getItem(`cgs_voice_${uid}`);
    if (voice) localStorage.setItem('cgs_voice', voice);
    setOk(true);
  }, [isLoaded, user]);

  if (!ok) return <div style={{ minHeight: '100vh' }} />;
  return <>{children}</>;
}
