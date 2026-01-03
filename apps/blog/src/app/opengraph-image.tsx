import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'うわむき - 上を向いて進んでいく技術ブログ';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          <svg
            aria-hidden="true"
            width="80"
            height="80"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="arrowGradient" x1="16" y1="28" x2="16" y2="4" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6B7280"/>
                <stop offset="100%" stopColor="#F9FAFB"/>
              </linearGradient>
            </defs>
            <path d="M16 6L16 26M16 6L8 14M16 6L24 14" stroke="url(#arrowGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#F8FAFC',
              letterSpacing: '-0.02em',
            }}
          >
            うわむき
          </span>
        </div>
        <span
          style={{
            fontSize: '28px',
            color: '#94A3B8',
          }}
        >
          上を向いて進んでいく技術ブログ
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
