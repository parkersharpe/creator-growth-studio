'use client';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}

export default function Sheet({ open, onClose, title, children, isDark }: SheetProps) {
  const t = isDark
    ? { bg: '#0f0f11', text: '#ffffff', text2: '#666666', border: '#1f1f22' }
    : { bg: '#ffffff', text: '#0a0a0a', text2: '#b0b0b0', border: '#efefef' };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)', zIndex: 200,
          }}
        />
      )}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%',
        transform: open ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100%)',
        width: '100%', maxWidth: '430px', background: t.bg,
        borderRadius: '24px 24px 0 0', padding: '0 24px 40px',
        maxHeight: '82vh', overflowY: 'auto', zIndex: 300,
        transition: 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
        borderTop: `1px solid ${t.border}`,
      }}>
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '14px', paddingBottom: '6px' }}>
          <div style={{
            width: '36px', height: '4px', borderRadius: '2px',
            background: isDark ? '#2a2a2e' : '#e5e5e5',
          }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 20px' }}>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: t.text, letterSpacing: '-0.02em' }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: isDark ? '#1f1f22' : '#f5f5f5',
              border: 'none', color: t.text2, cursor: 'pointer',
              fontSize: '1rem', lineHeight: 1, padding: '6px 10px',
              borderRadius: '20px', fontWeight: 700,
            }}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
