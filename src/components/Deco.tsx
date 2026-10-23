import { useId, type CSSProperties, type ReactNode } from 'react';

// Small physical bits: tape, ink stamps, clips, wax seals.
// Shared SVG filters (rough edges, torn edges) live in <PaperFilters />.

export function PaperFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        {/* slightly uneven, hand-cut edges */}
        <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* ripped edges, for torn notebook paper */}
        <filter id="torn" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="4" seed="8" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="11" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* patchy ink for rubber stamps */}
        <filter id="distress" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="speck" />
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="9" result="blot" />
          <feComposite in="speck" in2="blot" operator="arithmetic" k1="0" k2="0.6" k3="0.8" k4="-0.55" result="mask" />
          <feColorMatrix in="mask" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.9" result="alpha" />
          <feComposite in="SourceGraphic" in2="alpha" operator="in" />
        </filter>
        {/* uneven typewriter ink */}
        <filter id="ink" x="-2%" y="-10%" width="104%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="1" seed="2" result="speck" />
          <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.55" result="alpha" />
          <feComposite in="SourceGraphic" in2="alpha" operator="in" result="inked" />
          <feGaussianBlur in="inked" stdDeviation="0.25" />
        </filter>
        <linearGradient id="clip-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f1f2" />
          <stop offset="0.35" stopColor="#a9a1a4" />
          <stop offset="0.6" stopColor="#eae6e7" />
          <stop offset="1" stopColor="#8d8487" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// real washi tape, cut from a photo (public/images/deco/washi-*.png)
export type Washi = 'kraft' | 'kraft-tex' | 'torn' | 'olive' | 'mauve' | 'cream' | 'cream-tex' | 'gingham';
export const deco = (f: string) => `${import.meta.env.BASE_URL}images/deco/${f}`;

export function Tape({ style, className = '', variant = 'kraft' }: { style?: CSSProperties; className?: string; variant?: Washi }) {
  return <img className={`tape ${className}`} src={deco(`washi-${variant}.png`)} style={style} alt="" aria-hidden="true" />;
}

export function PaperClip({ style }: { style?: CSSProperties }) {
  return (
    <svg className="clip" viewBox="0 0 40 110" style={style} aria-hidden="true">
      <path
        d="M27 30 V86 a9 9 0 0 1 -18 0 V20 a13 13 0 0 1 26 0 V80 a4 4 0 0 1 -8 0 V30"
        fill="none" stroke="#5c5356" strokeOpacity="0.25" strokeWidth="4.5" strokeLinecap="round" transform="translate(1.5 2)"
      />
      <path
        d="M27 30 V86 a9 9 0 0 1 -18 0 V20 a13 13 0 0 1 26 0 V80 a4 4 0 0 1 -8 0 V30"
        fill="none" stroke="url(#clip-metal)" strokeWidth="3.6" strokeLinecap="round"
      />
    </svg>
  );
}

export function WaxSeal({ style, className = '', gold = false }: { style?: CSSProperties; className?: string; gold?: boolean }) {
  // photos of real pressed seals: the leaf one, or the small round gold one
  const src = gold ? deco('seal-gold.png') : `${import.meta.env.BASE_URL}images/wax-seal.png`;
  return <img className={`seal ${className}`} src={src} alt="" style={style} aria-hidden="true" />;
}

export function Paper({ children, className = '', style, edge = 'rough' }: { children: ReactNode; className?: string; style?: CSSProperties; edge?: 'rough' | 'torn' | 'clean' }) {
  return (
    <div className={`paper ${className}`} style={style}>
      <div className={`paper__bg paper__bg--${edge}`} aria-hidden="true" />
      <div className="paper__body">{children}</div>
    </div>
  );
}

// A rubber stamp pressed a little unevenly: double ring, text around the edge, ink that skips.
export function Stamp({ top, bottom, style, small = false }: { top: string; bottom?: string; style?: CSSProperties; small?: boolean }) {
  const id = `stamp${useId().replace(/:/g, '')}`;
  return (
    <svg className={`stamp${small ? ' stamp--small' : ''}`} viewBox="0 0 120 120" style={style} role="img" aria-label={[top, bottom].filter(Boolean).join(', ')}>
      <defs>
        <path id={`${id}-t`} d="M 24.5 60 A 35.5 35.5 0 0 1 95.5 60" />
        <path id={`${id}-b`} d="M 16 60 A 44 44 0 0 0 104 60" />
      </defs>
      <g filter="url(#distress)">
        <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="3.5" />
        <circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <text className="stamp__ring"><textPath href={`#${id}-t`} startOffset="50%" textAnchor="middle">{top}</textPath></text>
        {bottom && <text className="stamp__ring"><textPath href={`#${id}-b`} startOffset="50%" textAnchor="middle">{bottom}</textPath></text>}
        <text x="60" y="66" textAnchor="middle" className="stamp__star">★</text>
      </g>
    </svg>
  );
}
