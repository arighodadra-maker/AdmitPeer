'use client';

import { useState } from 'react';
import { getUniversityBrand } from '@/lib/universityColors';

type Props = {
  university: string;
  size?: 'sm' | 'md' | 'lg';
};

const CONFIG = {
  sm: { wh: 32, pad: 3,  fontSize: 8,  borderRadius: 6  },
  md: { wh: 44, pad: 5,  fontSize: 11, borderRadius: 8  },
  lg: { wh: 56, pad: 6,  fontSize: 13, borderRadius: 10 },
} as const;

export default function UniversityLogo({ university, size = 'md' }: Props) {
  const [imgError, setImgError] = useState(false);
  const brand = getUniversityBrand(university);
  const c = CONFIG[size];

  const wrapStyle: React.CSSProperties = {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
    width:           c.wh,
    height:          c.wh,
    borderRadius:    c.borderRadius,
    backgroundColor: brand.bg,
    overflow:        'hidden',
    boxShadow:       '0 1px 4px rgba(0,0,0,0.25)',
  };

  // Use faviconDomain override (e.g. athletics site) when the main .edu favicon isn't representative
  const faviconDomain = brand.faviconDomain ?? brand.domain;
  const logoUrl = faviconDomain
    ? `https://www.google.com/s2/favicons?domain=${faviconDomain}&sz=128`
    : null;

  if (logoUrl && !imgError) {
    return (
      <div style={wrapStyle} title={university}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={university}
          width={c.wh}
          height={c.wh}
          onError={() => setImgError(true)}
          style={{
            width:      c.wh - c.pad * 2,
            height:     c.wh - c.pad * 2,
            objectFit:  'contain',
          }}
        />
      </div>
    );
  }

  // Fallback: school-color badge with abbreviation
  return (
    <div style={wrapStyle} title={university}>
      <span style={{
        color:         brand.text,
        fontSize:      c.fontSize,
        fontWeight:    700,
        letterSpacing: '0.04em',
        lineHeight:    1,
        userSelect:    'none',
      }}>
        {brand.abbr}
      </span>
    </div>
  );
}
