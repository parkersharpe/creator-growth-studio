'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DARK, LIGHT, BG_PRESETS, GRADIENTS, FONTS, SEED_QUOTES } from '@/lib/theme';
import { Quote, BrandProfile, DesignSettings } from '@/lib/types';
import BottomNav from '@/components/BottomNav';

const DEFAULT_PROFILE: BrandProfile = {
  name: 'Parker Sharpe',
  handle: 'parkersharpe',
  niche: 'Entrepreneurship',
  website: '',
  avatar: '/avatar.jpg',
  verified: true,
};

const DEFAULT_DESIGN: DesignSettings = {
  bgType: 'solid',
  bgValue: '#000000',
  textColor: '#FFFFFF',
  handleColor: '#888888',
  font: 'Playfair Display',
  borderRadius: 16,
  shadow: true,
  padding: 40,
  photoShape: 'circle',
  photoSize: 52,
  verified: true,
  fontSize: 24,
};

export default function DesignerPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [profile, setProfile] = useState<BrandProfile>(DEFAULT_PROFILE);
  const [design, setDesign] = useState<DesignSettings>(DEFAULT_DESIGN);
  const [quotes, setQuotes] = useState<Quote[]>(SEED_QUOTES);
  const [activeQuote, setActiveQuote] = useState(0);
  const [bgTab, setBgTab] = useState<'solid' | 'gradient' | 'image' | 'video'>('solid');
  const [downloading, setDownloading] = useState(false);
  const [bgMedia, setBgMedia] = useState<{ type: 'image' | 'video'; url: string; duration?: number } | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [clipStart, setClipStart] = useState(0);
  const clipDuration = 7;
  const [format, setFormat] = useState<'1:1' | '4:5' | '9:16' | '16:9' | '2:3'>('1:1');
  const [editableTexts, setEditableTexts] = useState<Record<number, string>>({});
  const [isEditingText, setIsEditingText] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Preview dimensions — card renders at natural size, scaled down visually
  const PREVIEW_MAX_H = 240;
  const CONTAINER_W = 382;
  const FMT_RATIOS: Record<string, [number, number]> = {
    '1:1': [1,1], '4:5': [4,5], '9:16': [9,16], '16:9': [16,9], '2:3': [2,3],
  };
  const [fw, fh] = FMT_RATIOS[format] ?? [1,1];
  const naturalW = CONTAINER_W;
  const naturalH = Math.round(CONTAINER_W * fh / fw);
  const previewScale = naturalH > PREVIEW_MAX_H ? PREVIEW_MAX_H / naturalH : (naturalW > CONTAINER_W ? CONTAINER_W / naturalW : 1);
  const scaledW = Math.round(naturalW * previewScale);
  const scaledH = Math.round(naturalH * previewScale);

  const FORMATS: { id: '1:1' | '4:5' | '9:16' | '16:9' | '2:3'; label: string; ratio: string; w: number; h: number; desc: string }[] = [
    { id: '1:1',  label: '1:1',  ratio: '1 / 1',   w: 1080, h: 1080, desc: 'Feed' },
    { id: '4:5',  label: '4:5',  ratio: '4 / 5',   w: 1080, h: 1350, desc: 'Portrait' },
    { id: '9:16', label: '9:16', ratio: '9 / 16',  w: 1080, h: 1920, desc: 'Story' },
    { id: '16:9', label: '16:9', ratio: '16 / 9',  w: 1920, h: 1080, desc: 'Landscape' },
    { id: '2:3',  label: '2:3',  ratio: '2 / 3',   w: 1000, h: 1500, desc: 'Pinterest' },
  ];

  const t = isDark ? DARK : LIGHT;

  useEffect(() => {
    const savedTheme = localStorage.getItem('cgs_theme');
    if (savedTheme) setIsDark(savedTheme === 'dark');

    const savedProfile = localStorage.getItem('cgs_profile');
    if (savedProfile) { try { setProfile(JSON.parse(savedProfile)); } catch {} }

    const savedQuotes = localStorage.getItem('cgs_quotes');
    if (savedQuotes) { try { setQuotes(JSON.parse(savedQuotes)); } catch {} }

    const savedDesign = localStorage.getItem('cgs_design');
    if (savedDesign) { try { setDesign(JSON.parse(savedDesign)); } catch {} }

    const selectedQuoteIdx = localStorage.getItem('cgs_selected_quote');
    if (selectedQuoteIdx !== null) {
      setActiveQuote(Number(selectedQuoteIdx));
      localStorage.removeItem('cgs_selected_quote');
    }

    Object.values(FONTS).forEach((f) => {
      const id = `gf-${f.label}`;
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${f.google}&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, []);

  function updateDesign(patch: Partial<DesignSettings>) {
    const next = { ...design, ...patch };
    setDesign(next);
    localStorage.setItem('cgs_design', JSON.stringify(next));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBgMedia({ type: 'image', url });
    setVideoError(null);
    // Auto white text over uploaded image
    updateDesign({ textColor: '#FFFFFF', handleColor: 'rgba(255,255,255,0.65)' });
    e.target.value = '';
  }

  function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const vid = document.createElement('video');
    vid.src = url;
    vid.onloadedmetadata = () => {
      if (vid.duration > 30) {
        setVideoError(`Video must be 30 seconds or less. Your clip is ${vid.duration.toFixed(1)}s — trim it and re-upload.`);
        URL.revokeObjectURL(url);
      } else {
        setBgMedia({ type: 'video', url, duration: vid.duration });
        setClipStart(0);
        setVideoError(null);
        updateDesign({ textColor: '#FFFFFF', handleColor: 'rgba(255,255,255,0.65)' });
      }
    };
    e.target.value = '';
  }

  // Keep video looping within the 7s window
  function handleVideoTimeUpdate() {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.currentTime >= clipStart + clipDuration) {
      vid.currentTime = clipStart;
    }
  }

  function handleClipStartChange(val: number) {
    setClipStart(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      videoRef.current.play();
    }
  }

  function removeBgMedia() {
    if (bgMedia?.url) URL.revokeObjectURL(bgMedia.url);
    setBgMedia(null);
    setVideoError(null);
    // Reset text colors to match the solid bg color
    const isLightBg = design.bgValue === '#FFFFFF' || design.bgValue === '#F8F5EE' || design.bgValue === '#F0EAD6';
    updateDesign({
      textColor: isLightBg ? '#1A1A1A' : '#FFFFFF',
      handleColor: isLightBg ? '#666666' : '#888888',
    });
  }

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    const activeFormat = FORMATS.find(f => f.id === format)!;

    const cardEl = cardRef.current;

    // Remove CSS transform so html2canvas captures at true size
    const scaleWrapper = cardEl.parentElement as HTMLElement | null;
    const clippingShell = scaleWrapper?.parentElement as HTMLElement | null;
    let prevWrapperTransform = '';
    let prevShellOverflow = '';
    let prevShellW = '';
    let prevShellH = '';
    if (scaleWrapper && clippingShell) {
      prevWrapperTransform = scaleWrapper.style.transform;
      prevShellOverflow = clippingShell.style.overflow;
      prevShellW = clippingShell.style.width;
      prevShellH = clippingShell.style.height;
      scaleWrapper.style.transform = 'none';
      clippingShell.style.overflow = 'visible';
      clippingShell.style.width = naturalW + 'px';
      clippingShell.style.height = naturalH + 'px';
    }

    // Wait one frame so browser repaints at full size before we measure
    await new Promise(r => requestAnimationFrame(r));

    // Measure actual rendered dimensions AFTER removing transform
    const actualW = cardEl.offsetWidth;
    const actualH = cardEl.offsetHeight;
    const exportScale = activeFormat.w / actualW;

    try {
      const html2canvas = (await import('html2canvas')).default;

      const canvasOptions = {
        scale: exportScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: actualW,
        height: actualH,
        logging: false,
      };

      let canvas;
      if (bgMedia?.type === 'video' && videoRef.current) {
        const video = videoRef.current;
        canvas = await html2canvas(cardEl, {
          ...canvasOptions,
          onclone: (_doc: Document, el: HTMLElement) => {
            const vids = el.querySelectorAll('video');
            vids.forEach((v: HTMLVideoElement) => {
              const c = document.createElement('canvas');
              c.width = actualW;
              c.height = actualH;
              c.style.cssText = v.style.cssText;
              const cx = c.getContext('2d');
              if (cx) cx.drawImage(video, 0, 0, c.width, c.height);
              v.parentNode?.replaceChild(c, v);
            });
          },
        });
      } else {
        canvas = await html2canvas(cardEl, canvasOptions);
      }

      const filename = `cgs-${format.replace(':','-')}-${activeQuote + 1}.png`;

      // Mobile: use Web Share API so iPhone can save to Photos
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: 'Creator Growth Studio' });
            return;
          } catch {}
        }
        // Desktop fallback
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/png', 1.0);

    } catch (e) {
      console.error(e);
    } finally {
      // Restore transform
      if (scaleWrapper && clippingShell) {
        scaleWrapper.style.transform = prevWrapperTransform;
        clippingShell.style.overflow = prevShellOverflow;
        clippingShell.style.width = prevShellW;
        clippingShell.style.height = prevShellH;
      }
      setDownloading(false);
    }
  }

  const currentQuote = quotes[activeQuote] || quotes[0];
  const photoRadius = design.photoShape === 'circle' ? '50%' : design.photoShape === 'rounded' ? '12px' : '0px';

  const cardBgStyle = bgMedia
    ? { backgroundColor: '#000' }
    : design.bgType === 'gradient'
      ? { background: design.bgValue }
      : { backgroundColor: design.bgValue };

  const boxShadow = design.shadow ? '0 20px 60px rgba(0,0,0,0.5)' : 'none';

  return (
    <div style={{ background: t.bg, minHeight: '100vh', paddingBottom: '96px', transition: 'background 0.2s' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px 16px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.2 }}>Designer</h1>
          <p style={{ fontSize: '0.8rem', color: t.text2, marginTop: '2px' }}>Craft your quote card</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            background: downloading ? t.surface2 : t.btnBg, color: downloading ? t.text3 : t.btnTxt,
            border: 'none', borderRadius: '14px',
            padding: '0 20px', height: '44px', fontSize: '0.82rem', fontWeight: 700,
            cursor: downloading ? 'not-allowed' : 'pointer',
            boxShadow: downloading ? 'none' : t.shadowMd,
            transition: 'all 0.15s',
          }}
        >
          {downloading ? 'Saving...' : 'Download'}
        </button>
      </div>

      {/* Sticky preview wrapper — stays visible while scrolling controls */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: t.bg,
        paddingBottom: '12px',
        borderBottom: `1px solid ${t.border}`,
        marginBottom: '4px',
        boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)',
      }}>

      {/* Format selector */}
      <div style={{ padding: '0 24px 12px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {FORMATS.map(f => (
          <button
            key={f.id}
            onClick={() => setFormat(f.id)}
            style={{
              flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
            }}
          >
            {/* Mini aspect ratio preview box */}
            <div style={{
              width: f.id === '16:9' ? '40px' : f.id === '1:1' ? '28px' : f.id === '9:16' ? '18px' : f.id === '2:3' ? '22px' : '24px',
              height: f.id === '16:9' ? '22px' : f.id === '1:1' ? '28px' : f.id === '9:16' ? '32px' : f.id === '2:3' ? '33px' : '30px',
              borderRadius: '4px',
              background: format === f.id ? t.btnBg : 'transparent',
              border: `2px solid ${format === f.id ? t.btnBg : t.border2}`,
              transition: 'all 0.15s',
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: format === f.id ? t.text : t.text2 }}>{f.label}</span>
              <span style={{ fontSize: '0.58rem', color: t.text3, fontWeight: 500 }}>{f.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Card Preview — renders at natural size, scaled down with transform */}
      <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'center' }}>
        {/* Clipping shell — sized to scaled dimensions so it doesn't push layout */}
        <div style={{ width: scaledW, height: scaledH, overflow: 'hidden', flexShrink: 0 }}>
          {/* Natural-size inner — transform scales it visually */}
          <div style={{
            width: naturalW, height: naturalH,
            transformOrigin: 'top left',
            transform: `scale(${previewScale})`,
          }}>
        <div
          ref={cardRef}
          style={{
            ...cardBgStyle,
            borderRadius: `${design.borderRadius}px`,
            padding: `${design.padding}px`,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Media background */}
          {bgMedia?.type === 'image' && (
            <img
              src={bgMedia.url}
              alt=""
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', zIndex: 0,
              }}
            />
          )}
          {bgMedia?.type === 'video' && (
            <video
              ref={videoRef}
              src={bgMedia.url}
              autoPlay
              muted
              playsInline
              onTimeUpdate={handleVideoTimeUpdate}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', zIndex: 0,
              }}
            />
          )}
          {bgMedia && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.38)',
              zIndex: 1,
            }} />
          )}

          {/* Quote text — tap to edit */}
          <p
            key={activeQuote}
            contentEditable
            suppressContentEditableWarning
            onFocus={() => setIsEditingText(true)}
            onBlur={e => {
              setIsEditingText(false);
              const text = e.currentTarget.textContent || '';
              setEditableTexts(prev => ({ ...prev, [activeQuote]: text }));
            }}
            style={{
              fontFamily: `'${design.font}', serif`,
              color: design.textColor,
              fontSize: `${design.fontSize ?? 24}px`,
              lineHeight: 1.35,
              fontWeight: 600,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              outline: 'none',
              cursor: 'text',
              WebkitUserSelect: 'text',
              userSelect: 'text',
              borderRadius: '6px',
              transition: 'box-shadow 0.15s',
              boxShadow: isEditingText ? `0 0 0 2px ${design.textColor}40` : 'none',
              padding: '4px',
              margin: '-4px',
              minHeight: '1em',
              wordBreak: 'break-word',
            }}
          >
            {editableTexts[activeQuote] ?? currentQuote?.text}
          </p>

          {/* Profile row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginTop: format === '16:9' ? '10px' : '16px',
            flexShrink: 0,
            position: 'relative', zIndex: 2,
            overflow: 'hidden',
          }}>
            <img
              src={profile.avatar}
              alt={profile.name}
              style={{
                width: format === '16:9' ? `${Math.min(design.photoSize, 36)}px` : `${design.photoSize}px`,
                height: format === '16:9' ? `${Math.min(design.photoSize, 36)}px` : `${design.photoSize}px`,
                borderRadius: photoRadius,
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: format === '16:9' ? '0.78rem' : '0.9rem',
                fontWeight: 700, color: design.textColor,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {profile.name}
                {design.verified && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <path d="M12 2L13.8 5.4L17.6 4.2L17.2 8.1L21 9.6L18.6 12.8L21 16L17.2 17.5L17.6 21.4L13.8 20.2L12 23.6L10.2 20.2L6.4 21.4L6.8 17.5L3 16L5.4 12.8L3 9.6L6.8 8.1L6.4 4.2L10.2 5.4L12 2Z" fill="#1877F2"/>
                    <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div style={{
                fontSize: format === '16:9' ? '0.68rem' : '0.8rem',
                color: design.handleColor === 'rgba(255,255,255,0.65)' && !bgMedia
                  ? `${design.textColor}99`
                  : design.handleColor,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                @{profile.handle}
              </div>
            </div>
          </div>
        </div>
          </div>{/* end natural-size inner */}
        </div>{/* end clipping shell */}
      </div>

      {/* Tap to edit hint */}
      {!isEditingText && (
        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          <span style={{
            fontSize: '0.65rem', color: t.text3, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: '4px',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={t.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Tap quote text to edit
          </span>
        </div>
      )}

      {/* Quote dot navigator */}
      <div style={{ padding: '12px 16px 0 16px', display: 'flex', gap: '5px', paddingBottom: '4px', justifyContent: 'space-between' }}>
        {quotes.slice(0, 10).map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveQuote(i)}
            style={{
              flex: 1, height: '28px', borderRadius: '20px',
              background: activeQuote === i ? t.btnBg : t.surface2,
              border: `1px solid ${activeQuote === i ? 'transparent' : t.border}`,
              color: activeQuote === i ? t.btnTxt : t.text2,
              fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s', minWidth: 0,
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      </div>{/* end sticky wrapper */}

      {/* Settings */}
      <div style={{ padding: '24px' }}>

        {/* Background */}
        <Section title="Background" t={t}>
          {/* Tab row */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
            {(['solid', 'gradient', 'image', 'video'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setBgTab(tab)}
                style={{
                  padding: '7px 14px', borderRadius: '20px', cursor: 'pointer',
                  background: bgTab === tab ? t.pillActive : t.pill,
                  border: `1px solid ${bgTab === tab ? 'transparent' : t.pillBrd}`,
                  color: bgTab === tab ? t.pillActiveTxt : t.pillTxt,
                  fontSize: '0.75rem', fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {bgTab === 'solid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {BG_PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => updateDesign({ bgValue: p.value, bgType: 'solid', textColor: p.text })}
                  title={p.label}
                  style={{
                    height: '44px', borderRadius: '10px',
                    background: p.value, cursor: 'pointer',
                    border: design.bgValue === p.value && !bgMedia ? `3px solid ${t.text}` : `2px solid ${t.border}`,
                    transition: 'border 0.1s',
                  }}
                />
              ))}
            </div>
          )}

          {bgTab === 'gradient' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {GRADIENTS.map(g => (
                <button
                  key={g.value}
                  onClick={() => updateDesign({ bgValue: g.value, bgType: 'gradient', textColor: g.text })}
                  style={{
                    height: '48px', borderRadius: '12px', background: g.value,
                    border: design.bgValue === g.value && !bgMedia ? `3px solid ${t.text}` : `2px solid ${t.border}`,
                    cursor: 'pointer', transition: 'border 0.1s',
                    display: 'flex', alignItems: 'center', paddingLeft: '14px',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: g.text, opacity: 0.8 }}>{g.label}</span>
                </button>
              ))}
            </div>
          )}

          {bgTab === 'image' && (
            <div>
              {bgMedia?.type === 'image' ? (
                <div>
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
                    <img
                      src={bgMedia.url}
                      alt="Background preview"
                      style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <button
                    onClick={removeBgMedia}
                    style={{
                      width: '100%', height: '40px', background: 'transparent',
                      border: `1px solid ${t.border}`, borderRadius: '10px',
                      fontSize: '0.8rem', fontWeight: 600, color: t.text2, cursor: 'pointer',
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  height: '120px', border: `2px dashed ${t.border2}`, borderRadius: '12px',
                  cursor: 'pointer', gap: '8px',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: t.text2 }}>Upload Image</span>
                  <span style={{ fontSize: '0.72rem', color: t.text3 }}>JPG, PNG, WEBP</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          )}

          {bgTab === 'video' && (
            <div>
              {videoError && (
                <div style={{
                  padding: '12px 14px', background: 'rgba(220,53,69,0.1)',
                  border: '1px solid rgba(220,53,69,0.3)', borderRadius: '10px',
                  fontSize: '0.8rem', color: '#e05260', lineHeight: 1.5, marginBottom: '12px',
                }}>
                  {videoError}
                </div>
              )}
              {bgMedia?.type === 'video' ? (
                <div>
                  {/* 7s tip banner */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'linear-gradient(135deg, #16a34a18, #16a34a08)',
                    border: '1px solid #16a34a40',
                    borderRadius: '12px', padding: '10px 14px', marginBottom: '10px',
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>⚡</span>
                    <p style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                      7-second clips get <span style={{ fontWeight: 800 }}>3× more views</span> — pick your best 7s below
                    </p>
                  </div>

                  {/* Clip trimmer */}
                  <div style={{
                    background: t.surface2, border: `1px solid ${t.border}`,
                    borderRadius: '14px', padding: '16px', marginBottom: '10px',
                  }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: t.text }}>
                        {bgMedia.duration && bgMedia.duration <= 7 ? 'Looping full clip' : 'Pick your 7-second clip'}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700, color: '#fff',
                          background: '#16a34a', borderRadius: '6px', padding: '2px 8px',
                        }}>7s loop</span>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 600, color: t.text3,
                          background: t.surface, border: `1px solid ${t.border}`,
                          borderRadius: '6px', padding: '2px 8px',
                        }}>{bgMedia.duration ? `${bgMedia.duration.toFixed(1)}s total` : ''}</span>
                      </div>
                    </div>

                    {/* Timeline bar — show whenever video is longer than 7s */}
                    {bgMedia.duration && bgMedia.duration > 7 ? (
                      <div>
                        <div style={{ position: 'relative', height: '36px', marginBottom: '10px' }}>
                          {/* Full track */}
                          <div style={{
                            position: 'absolute', top: '50%', left: 0, right: 0,
                            height: '4px', borderRadius: '2px',
                            background: t.border2, transform: 'translateY(-50%)',
                          }} />
                          {/* Selected 7s window highlight */}
                          <div style={{
                            position: 'absolute', top: '50%',
                            left: `${(clipStart / bgMedia.duration) * 100}%`,
                            width: `${(clipDuration / bgMedia.duration) * 100}%`,
                            height: '4px', borderRadius: '2px',
                            background: t.btnBg, transform: 'translateY(-50%)',
                            transition: 'left 0.05s',
                          }} />
                          {/* Left bracket */}
                          <div style={{
                            position: 'absolute', top: '50%',
                            left: `${(clipStart / bgMedia.duration) * 100}%`,
                            width: '3px', height: '16px', borderRadius: '2px',
                            background: t.btnBg, transform: 'translate(0, -50%)',
                            transition: 'left 0.05s',
                          }} />
                          {/* Right bracket */}
                          <div style={{
                            position: 'absolute', top: '50%',
                            left: `calc(${((clipStart + clipDuration) / bgMedia.duration) * 100}% - 3px)`,
                            width: '3px', height: '16px', borderRadius: '2px',
                            background: t.btnBg, transform: 'translate(0, -50%)',
                            transition: 'left 0.05s',
                          }} />
                          {/* Invisible range input */}
                          <input
                            type="range"
                            min={0}
                            max={Math.max(0, bgMedia.duration - clipDuration)}
                            step={0.1}
                            value={clipStart}
                            onChange={e => handleClipStartChange(Number(e.target.value))}
                            style={{
                              position: 'absolute', inset: 0, width: '100%',
                              opacity: 0, cursor: 'pointer', height: '100%', margin: 0,
                            }}
                          />
                        </div>
                        {/* Time labels */}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.68rem', color: t.text2, fontWeight: 600 }}>
                            Start: {clipStart.toFixed(1)}s
                          </span>
                          <span style={{ fontSize: '0.68rem', color: t.text2, fontWeight: 600 }}>
                            End: {(clipStart + clipDuration).toFixed(1)}s
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: t.text2, textAlign: 'center', padding: '6px 0' }}>
                        Your clip is {bgMedia.duration?.toFixed(1)}s — looping the full thing ✓
                      </div>
                    )}
                  </div>

                  <button
                    onClick={removeBgMedia}
                    style={{
                      width: '100%', height: '40px', background: 'transparent',
                      border: `1px solid ${t.border}`, borderRadius: '10px',
                      fontSize: '0.8rem', fontWeight: 600, color: t.text2, cursor: 'pointer',
                    }}
                  >
                    Remove Video
                  </button>
                </div>
              ) : (
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  height: '120px', border: `2px dashed ${t.border2}`, borderRadius: '12px',
                  cursor: 'pointer', gap: '8px',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={t.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="3"/>
                    <path d="M10 8l6 4-6 4V8z" fill={t.text3} stroke="none"/>
                  </svg>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: t.text2 }}>Upload Video</span>
                  <span style={{ fontSize: '0.72rem', color: t.text3 }}>MP4, MOV · Up to 30 seconds</span>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          )}
        </Section>

        {/* Text Size */}
        <Section title="Text Size" t={t}>
          <SliderRow
            label="Quote font size"
            value={design.fontSize ?? 24}
            min={12}
            max={48}
            unit="px"
            onChange={v => updateDesign({ fontSize: v })}
            t={t}
          />
        </Section>

        {/* Font */}
        <Section title="Font" t={t}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(FONTS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => updateDesign({ font: key as DesignSettings['font'] })}
                style={{
                  padding: '13px 16px', borderRadius: '12px', cursor: 'pointer',
                  background: design.font === key ? t.surface2 : 'transparent',
                  border: `1px solid ${design.font === key ? t.border2 : t.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.1s',
                }}
              >
                <span style={{ fontFamily: `'${key}', serif`, fontSize: '0.95rem', color: t.text, fontWeight: 500 }}>{key}</span>
                <span style={{ fontSize: '0.68rem', color: t.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{val.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Colors */}
        <Section title="Colors" t={t}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', background: t.surface2, borderRadius: '12px', border: `1px solid ${t.border}`,
            }}>
              <span style={{ fontSize: '0.82rem', color: t.text2, fontWeight: 500 }}>Text color</span>
              <input
                type="color"
                value={design.textColor}
                onChange={e => updateDesign({ textColor: e.target.value })}
                style={{ width: '40px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '6px' }}
              />
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', background: t.surface2, borderRadius: '12px', border: `1px solid ${t.border}`,
            }}>
              <span style={{ fontSize: '0.82rem', color: t.text2, fontWeight: 500 }}>Handle color</span>
              <input
                type="color"
                value={design.handleColor}
                onChange={e => updateDesign({ handleColor: e.target.value })}
                style={{ width: '40px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '6px' }}
              />
            </div>
          </div>
        </Section>

        {/* Card */}
        <Section title="Card" t={t}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SliderRow
              label="Corner radius"
              value={design.borderRadius}
              min={0} max={40}
              onChange={v => updateDesign({ borderRadius: v })}
              t={t}
            />
            <SliderRow
              label="Padding"
              value={design.padding}
              min={16} max={72}
              onChange={v => updateDesign({ padding: v })}
              t={t}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: t.text2, fontWeight: 500 }}>Drop shadow</span>
              <ToggleSwitch
                value={design.shadow}
                onChange={v => updateDesign({ shadow: v })}
                isDark={isDark}
              />
            </div>
          </div>
        </Section>

        {/* Profile */}
        <Section title="Profile" t={t}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: t.text2, marginBottom: '10px', fontWeight: 500 }}>Photo shape</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['circle', 'rounded', 'square'] as const).map(shape => (
                  <button
                    key={shape}
                    onClick={() => updateDesign({ photoShape: shape })}
                    style={{
                      flex: 1, padding: '9px', borderRadius: '12px', cursor: 'pointer',
                      background: design.photoShape === shape ? t.pillActive : t.pill,
                      border: `1px solid ${design.photoShape === shape ? 'transparent' : t.pillBrd}`,
                      color: design.photoShape === shape ? t.pillActiveTxt : t.pillTxt,
                      fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                      transition: 'all 0.15s',
                    }}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
            <SliderRow
              label="Photo size"
              value={design.photoSize}
              min={32} max={80}
              onChange={v => updateDesign({ photoSize: v })}
              t={t}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: t.text2, fontWeight: 500 }}>Verified badge</span>
              <ToggleSwitch
                value={design.verified}
                onChange={v => updateDesign({ verified: v })}
                isDark={isDark}
              />
            </div>
          </div>
        </Section>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Preview full size */}
          <button
            onClick={() => setShowPreview(true)}
            style={{
              width: '100%', height: '56px',
              background: t.surface2, color: t.text,
              border: `1px solid ${t.border2}`, borderRadius: '16px',
              fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
              letterSpacing: '-0.02em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            View Full Size
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              width: '100%', height: '56px', background: downloading ? t.surface2 : t.btnBg,
              color: downloading ? t.text3 : t.btnTxt, border: 'none', borderRadius: '16px',
              fontSize: '0.95rem', fontWeight: 800, cursor: downloading ? 'not-allowed' : 'pointer',
              boxShadow: downloading ? 'none' : t.shadowMd,
              letterSpacing: '-0.02em', transition: 'all 0.15s',
            }}
          >
            {downloading ? 'Saving...' : bgMedia?.type === 'video' ? 'Download Video' : 'Download Image'}
          </button>

          {/* Instagram Share */}
          <button
            onClick={async () => {
              if (!cardRef.current) return;
              try {
                const html2canvas = (await import('html2canvas')).default;
                const canvas = await html2canvas(cardRef.current, {
                  scale: 3, useCORS: true, backgroundColor: null,
                  width: cardRef.current.offsetWidth, height: cardRef.current.offsetHeight,
                });
                canvas.toBlob(async (blob) => {
                  if (!blob) return;
                  const file = new File([blob], 'quote.png', { type: 'image/png' });
                  if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: 'Quote', text: currentQuote?.text });
                  } else {
                    const link = document.createElement('a');
                    link.download = 'quote.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    setTimeout(() => window.open('https://www.instagram.com', '_blank'), 800);
                  }
                }, 'image/png');
              } catch (e) { console.error(e); }
            }}
            style={{
              width: '100%', height: '56px',
              background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
              color: '#fff', border: 'none', borderRadius: '16px',
              fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
              letterSpacing: '-0.02em', transition: 'opacity 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/>
            </svg>
            Post to Instagram
          </button>

          <p style={{ fontSize: '0.68rem', color: t.text3, textAlign: 'center', lineHeight: 1.5 }}>
            On iPhone: tap Share, then choose Instagram. On desktop: image downloads first, then upload manually.
          </p>
        </div>
      </div>

      <BottomNav
        active="designer"
        onNavigate={(href) => router.push(href)}
        isDark={isDark}
      />

      {/* Full-size preview modal */}
      {showPreview && (
        <div
          onClick={() => setShowPreview(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>

          {/* Close hint */}
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '16px', fontWeight: 500 }}>
            Tap anywhere to close
          </p>

          {/* Full-size card replica — constrained by viewport, exact aspect ratio */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              ...cardBgStyle,
              borderRadius: `${design.borderRadius}px`,
              padding: `${design.padding}px`,
              aspectRatio: FORMATS.find(f => f.id === format)?.ratio ?? '1 / 1',
              // Fit within screen: tall formats constrain by height, wide by width
              maxHeight: ['9:16','4:5','2:3'].includes(format) ? '80vh' : 'none',
              maxWidth: ['16:9','1:1'].includes(format) ? 'min(430px, 92vw)' : `calc(80vh * ${fw} / ${fh})`,
              width: ['9:16','4:5','2:3'].includes(format) ? 'auto' : 'min(430px, 92vw)',
              height: ['9:16','4:5','2:3'].includes(format) ? '80vh' : 'auto',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Media background */}
            {bgMedia?.type === 'image' && (
              <img src={bgMedia.url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
            )}
            {bgMedia?.type === 'video' && (
              <video src={bgMedia.url} autoPlay muted playsInline loop style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
            )}
            {bgMedia && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)', zIndex: 1 }} />}

            <p style={{
              fontFamily: `'${design.font}', serif`,
              color: design.textColor,
              fontSize: `${design.fontSize ?? 24}px`,
              lineHeight: 1.35, fontWeight: 600,
              flex: 1, display: 'flex', alignItems: 'center',
              position: 'relative', zIndex: 2,
              margin: 0, wordBreak: 'break-word',
            }}>
              {editableTexts[activeQuote] ?? currentQuote?.text}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', flexShrink: 0, position: 'relative', zIndex: 2 }}>
              <img src={profile.avatar} alt={profile.name} style={{ width: `${design.photoSize}px`, height: `${design.photoSize}px`, borderRadius: design.photoShape === 'circle' ? '50%' : design.photoShape === 'rounded' ? '12px' : '0', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: design.textColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {profile.name}
                  {design.verified && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L13.8 5.4L17.6 4.2L17.2 8.1L21 9.6L18.6 12.8L21 16L17.2 17.5L17.6 21.4L13.8 20.2L12 23.6L10.2 20.2L6.4 21.4L6.8 17.5L3 16L5.4 12.8L3 9.6L6.8 8.1L6.4 4.2L10.2 5.4L12 2Z" fill="#1877F2"/><path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: design.handleColor === 'rgba(255,255,255,0.65)' && !bgMedia ? `${design.textColor}99` : design.handleColor }}>@{profile.handle}</div>
              </div>
            </div>
          </div>

          {/* Download / Share from preview */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', width: '100%', maxWidth: '340px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowPreview(false); handleDownload(); }}
              style={{
                flex: 1, height: '48px', background: '#fff', color: '#000',
                border: 'none', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
              }}
            >
              Download
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowPreview(false); }}
              style={{
                flex: 1, height: '48px', background: 'rgba(255,255,255,0.12)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Back to Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children, t }: { title: string; children: React.ReactNode; t: typeof DARK }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{
        fontSize: '0.68rem', fontWeight: 700, color: t.text3,
        textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '14px',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function SliderRow({ label, value, min, max, unit, onChange, t }: {
  label: string; value: number; min: number; max: number; unit?: string;
  onChange: (v: number) => void; t: typeof DARK;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.82rem', color: t.text2, fontWeight: 500 }}>{label}</span>
        <span style={{
          fontSize: '0.75rem', color: t.btnTxt, fontWeight: 700,
          background: t.btnBg, borderRadius: '8px', padding: '3px 10px', letterSpacing: '-0.01em',
        }}>{value}{unit || ''}</span>
      </div>
      <div style={{ position: 'relative', height: '28px', display: 'flex', alignItems: 'center' }}>
        {/* Track background */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '4px',
          borderRadius: '2px', background: t.border2,
        }} />
        {/* Track fill */}
        <div style={{
          position: 'absolute', left: 0, width: `${pct}%`, height: '4px',
          borderRadius: '2px', background: t.btnBg, pointerEvents: 'none',
        }} />
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: 'absolute', left: 0, right: 0, width: '100%',
            opacity: 0, height: '28px', cursor: 'pointer', margin: 0,
          }}
        />
        {/* Thumb */}
        <div style={{
          position: 'absolute', left: `calc(${pct}% - 10px)`,
          width: '20px', height: '20px', borderRadius: '50%',
          background: t.btnBg, boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          border: `2px solid ${t.bg}`, pointerEvents: 'none', transition: 'left 0.05s',
        }} />
      </div>
    </div>
  );
}

function ToggleSwitch({ value, onChange, isDark }: { value: boolean; onChange: (v: boolean) => void; isDark: boolean }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: '46px', height: '28px', borderRadius: '14px',
        background: value ? (isDark ? '#ffffff' : '#0a0a0a') : (isDark ? '#1f1f22' : '#e5e5e5'),
        border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '4px',
        left: value ? '22px' : '4px',
        width: '20px', height: '20px', borderRadius: '50%',
        background: value ? (isDark ? '#000' : '#fff') : (isDark ? '#444' : '#fff'),
        transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      }} />
    </button>
  );
}
