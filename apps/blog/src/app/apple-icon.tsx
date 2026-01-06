import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
        borderRadius: '32px',
      }}
    >
      <svg
        aria-hidden="true"
        width="120"
        height="120"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="arrowGradient"
            x1="16"
            y1="28"
            x2="16"
            y2="4"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6B7280" />
            <stop offset="100%" stopColor="#F9FAFB" />
          </linearGradient>
        </defs>
        <path
          d="M16 6L16 26M16 6L8 14M16 6L24 14"
          stroke="url(#arrowGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>,
    {
      ...size,
    }
  );
}
