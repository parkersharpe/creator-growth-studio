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
    const profile = localStorage.getItem(`cgs_profile_${uid}`) || localStorage.getItem('cgs_profile');
    if (!profile) { router.replace('/onboarding'); return; }
    setOk(true);
  }, [isLoaded, user]);

  if (!ok) return <div style={{ minHeight: '100vh', background: '#050507' }} />;
  return <>{children}</>;
}
