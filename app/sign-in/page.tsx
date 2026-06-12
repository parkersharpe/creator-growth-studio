'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f7',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
            <path d="M32 6 C32 6 30 19 30 27 C30 27 19 29 6 32 C6 32 19 35 30 37 C30 37 32 50 32 58 C32 58 34 50 34 37 C34 37 45 35 58 32 C58 32 45 29 34 27 C34 27 32 19 32 6 Z" fill="#000000"/>
          </svg>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#000000', letterSpacing: '-0.03em' }}>
            Creator<span style={{ opacity: 0.35, fontWeight: 700 }}>Studio</span>
          </span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'rgba(0,0,0,0.45)', fontWeight: 400 }}>
          Your AI-powered content studio
        </p>
      </div>

      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#000000',
            colorBackground: '#ffffff',
            borderRadius: '14px',
            fontFamily: 'DM Sans, sans-serif',
          },
          elements: {
            card: {
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
              borderRadius: '20px',
              padding: '32px 28px',
            },
            headerTitle: { color: '#000000', fontSize: '1.2rem', fontWeight: 800 },
            headerSubtitle: { color: 'rgba(0,0,0,0.45)' },
            socialButtonsBlockButton: {
              background: '#f5f5f7',
              border: '1px solid rgba(0,0,0,0.1)',
              color: '#000000',
              borderRadius: '12px',
              fontWeight: 600,
            },
            socialButtonsBlockButtonText: { color: '#000000', fontWeight: 600 },
            dividerLine: { background: 'rgba(0,0,0,0.08)' },
            dividerText: { color: 'rgba(0,0,0,0.3)' },
            formButtonPrimary: {
              background: '#000000',
              color: '#ffffff',
              fontWeight: 800,
              borderRadius: '12px',
            },
            footerActionLink: { color: 'rgba(0,0,0,0.5)' },
          },
        }}
      />
    </div>
  );
}
