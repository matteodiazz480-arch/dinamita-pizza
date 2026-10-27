import React, { useId } from 'react';

/**
 * Replicates the exact Slice Town 3-row faded checkerboard transition
 * between sections from `fromColor` (top) to `toColor` (bottom).
 */
export default function CheckeredDivider({ fromColor = '#FFFDF7', toColor = '#EC4A13' }) {
  const uid = useId().replace(/:/g, '');
  const patternId = `checker-pat-${uid}`;
  const gradId = `checker-grad-${uid}`;
  const maskId = `checker-mask-${uid}`;

  // 3 rows of 14px squares = 42px height; pattern width = 28px (2 squares of 14px)
  const sq = 14;
  const patW = sq * 2;
  const totalH = sq * 3;

  return (
    <div
      className="w-full overflow-hidden leading-none select-none pointer-events-none block"
      style={{ backgroundColor: fromColor, height: `${totalH}px` }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full block"
        preserveAspectRatio="none"
        width="100%"
        height={totalH}
      >
        <defs>
          {/* Checkerboard repeating pattern */}
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={patW}
            height={totalH}
            patternUnits="userSpaceOnUse"
          >
            {/* Row 1 (top): right square */}
            <rect x={sq} y={0} width={sq} height={sq} fill={toColor} />
            {/* Row 2 (middle): left square */}
            <rect x={0} y={sq} width={sq} height={sq} fill={toColor} />
            {/* Row 3 (bottom): right square */}
            <rect x={sq} y={sq * 2} width={sq} height={sq} fill={toColor} />
          </pattern>

          {/* Vertical fade gradient from subtle at top to 100% solid at bottom */}
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.18" />
            <stop offset="45%" stopColor="white" stopOpacity="0.55" />
            <stop offset="85%" stopColor="white" stopOpacity="0.92" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>

          <mask id={maskId}>
            <rect x="0" y="0" width="100%" height={totalH} fill={`url(#${gradId})`} />
          </mask>
        </defs>

        <rect
          x="0"
          y="0"
          width="100%"
          height={totalH}
          fill={`url(#${patternId})`}
          mask={`url(#${maskId})`}
        />
      </svg>
    </div>
  );
}
