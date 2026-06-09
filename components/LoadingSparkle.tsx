'use client';

interface Props {
  label?: string;
  size?: 'sm' | 'md';
  light?: boolean;
}

export default function LoadingSparkle({ label, size = 'md', light = false }: Props) {
  const color = light ? '#ffffff' : 'currentColor';
  const sz = size === 'sm' ? 14 : 18;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <style>{`
        @keyframes sparkle-spin {
          0%   { transform: rotate(0deg) scale(1); opacity: 1; }
          25%  { transform: rotate(90deg) scale(1.2); opacity: 0.8; }
          50%  { transform: rotate(180deg) scale(0.85); opacity: 0.6; }
          75%  { transform: rotate(270deg) scale(1.15); opacity: 0.9; }
          100% { transform: rotate(360deg) scale(1); opacity: 1; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>

      {/* Spinning sparkle */}
      <svg
        width={sz} height={sz} viewBox="0 0 24 24" fill={color}
        style={{ animation: 'sparkle-spin 1.2s cubic-bezier(0.4,0,0.6,1) infinite', flexShrink: 0 }}
      >
        <path d="M12 2C12 2 11 9 11 13C11 13 5 14 2 16C2 16 9 18 11 19C11 19 12 22 12 22C12 22 13 22 13 19C13 19 19 18 22 16C22 16 17 14 13 13C13 13 12 9 12 2Z"/>
        <path d="M19 4C19 4 18.5 7 18.5 9C18.5 9 16 9.5 15 10.5C15 10.5 18 11 18.5 12C18.5 12 19 14 19 14C19 14 19.5 12 20 11C20 11 22 10.5 22.5 9.5C22.5 9.5 20 9 19.5 8C19.5 8 19 6 19 4Z" opacity="0.5"/>
      </svg>

      {/* Bouncing dots */}
      {label && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontSize: size === 'sm' ? '0.78rem' : '0.88rem', fontWeight: 700, opacity: 0.9 }}>{label}</span>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{
                width: '3px', height: '3px', borderRadius: '50%',
                background: color, display: 'inline-block',
                animation: `dot-bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
                marginLeft: i === 0 ? '2px' : '1px',
              }}
            />
          ))}
        </span>
      )}
    </span>
  );
}
