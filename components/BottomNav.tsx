'use client';

import Link from 'next/link';

const TABS = [
  {
    id: 'generate',
    label: 'Generate',
    href: '/',
    icon: (active: boolean, color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill={active ? color : 'none'} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M19 15L19.8 17.2L22 18L19.8 18.8L19 21L18.2 18.8L16 18L18.2 17.2L19 15Z" fill={color} stroke="none"/>
      </svg>
    ),
  },
  {
    id: 'designer',
    label: 'Designer',
    href: '/designer',
    icon: (active: boolean, color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 19L5 12L8 4L16 4L19 12L12 19Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={active ? color : 'none'} fillOpacity={active ? 0.15 : 0}/>
        <circle cx="12" cy="12" r="2.5" fill={color}/>
      </svg>
    ),
  },
  {
    id: 'machine',
    label: 'Machine',
    href: '/machine',
    icon: (active: boolean, color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.5" fill={active ? color : 'none'} fillOpacity={active ? 0.15 : 0}/>
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.5" fill={active ? color : 'none'} fillOpacity={active ? 0.15 : 0}/>
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.5" fill={active ? color : 'none'} fillOpacity={active ? 0.15 : 0}/>
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.5" fill={active ? color : 'none'} fillOpacity={active ? 0.15 : 0}/>
      </svg>
    ),
  },
  {
    id: 'saved',
    label: 'Saved',
    href: '/saved',
    icon: (active: boolean, color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={active ? color : 'none'} fillOpacity={active ? 0.2 : 0}/>
      </svg>
    ),
  },
  {
    id: 'brand',
    label: 'Brand',
    href: '/brand',
    icon: (active: boolean, color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth="1.5" fill={active ? color : 'none'} fillOpacity={active ? 0.15 : 0}/>
        <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

interface BottomNavProps {
  active: string;
  onNavigate?: (href: string, id: string) => void;
  isDark: boolean;
}

export default function BottomNav({ active, isDark }: BottomNavProps) {
  const navBg = isDark ? 'rgba(5,5,7,0.92)' : 'rgba(255,255,255,0.92)';
  const border = isDark ? '#1f1f22' : '#efefef';
  const colorActive = isDark ? '#ffffff' : '#0a0a0a';
  const colorInactive = isDark ? '#444444' : '#b0b0b0';

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '430px', background: navBg,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: `1px solid ${border}`,
      display: 'flex', paddingBottom: 'env(safe-area-inset-bottom, 12px)',
      zIndex: 100, height: '64px',
    }}>
      {TABS.map(tab => {
        const isActive = active === tab.id;
        const color = isActive ? colorActive : colorInactive;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            prefetch
            style={{
              flex: 1, paddingTop: '10px', paddingBottom: '6px', background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              textDecoration: 'none',
              opacity: isActive ? 1 : 0.7,
              transition: 'opacity 0.15s',
            }}
          >
            {tab.icon(isActive, color)}
            <span style={{
              fontSize: '0.6rem', letterSpacing: '0.01em',
              color,
              fontWeight: isActive ? 700 : 500,
            }}>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
