'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  // Render optimistically — middleware enforces auth server-side and CloudSync
  // has already placed the signed-in user's data into localStorage before any
  // page renders. Only blank the screen while actively redirecting someone who
  // lacks access, so valid users get instant, flash-free tab switches.
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { setDenied(true); router.replace('/sign-in'); return; }
    const uid = user.id;
    // Strictly user-scoped — never fall back to another user's profile
    const profile = localStorage.getItem(`cgs_profile_${uid}`);
    if (!profile) { setDenied(true); router.replace('/onboarding'); return; }
    // Keep device-wide keys aligned with the signed-in user (safety net)
    if (localStorage.getItem('cgs_profile') !== profile) localStorage.setItem('cgs_profile', profile);
    const voice = localStorage.getItem(`cgs_voice_${uid}`);
    if (voice && localStorage.getItem('cgs_voice') !== voice) localStorage.setItem('cgs_voice', voice);
    setDenied(false);
  }, [isLoaded, user]);

  if (denied) return <div style={{ minHeight: '100vh' }} />;
  return <>{children}</>;
}
