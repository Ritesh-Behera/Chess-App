import { useId } from "react";
import type { PiecePalette } from "../../lib/pieceThemes";

export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

interface PieceSVGProps {
  type: PieceType;
  palette: PiecePalette;
  className?: string;
}

// Original, simplified geometric silhouettes (not a trace of any existing
// piece set) rendered on a shared 100x100 grid with a soft top-lit gradient
// and a grounded base shadow, so the whole set reads as one cohesive family.
const PATHS: Record<PieceType, string> = {
  p: "M50 20a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm-7 22h14l6 20H37l6-20Zm-13 24h40l4 10H22l4-10Zm-6 14h52l3 9H21l3-9Z",
  r: "M28 16h9v9h10v-9h6v9h10v-9h9v18l-6 6v30h6l6 10H24l6-10h6V40l-6-6V16Zm-6 62h56l4 10H18l4-10Z",
  b: "M50 14a9 9 0 0 1 6 15.8c7 4 11.4 11.6 11.4 21.2 0 9-5 16-11.4 19.4l1 3.1h6l4 10H33l4-10h6l1-3.1C37.6 67 32.6 60 32.6 51c0-9.6 4.4-17.2 11.4-21.2A9 9 0 0 1 50 14Zm0 8.5a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2ZM24 84h52l4 10H20l4-10Z",
  n: "M63 12c-14 0-27 9-31 22-2.4 7.6-1 13 2 18-4 3-8 8-9 15l-2 12h12l1-7c1-6 4-10 8-12 3 5 8 8 14 8h6l4 10H30l4-10h5c-8 0-15-5-18-12-3-7-1-15 4-21 3-4 8-9 8-16 0-8 8-13 16-13 9 0 15 6 15 6l-1 8s-4-4-9-4c-4 0-6 2-6 4 0 3 3 4 6 6 5 3 9 7 9 13 0 6-4 10-9 12l3 9h6l4 10H55l4-10h4l-3-8c6-1 10-5 10-11 0-3-2-6-5-8-2-1-3-3-3-5 0-2 2-3 4-3 3 0 6 2 6 2l2-11s-5-6-11-6Z",
  q: "M50 12l4 10-4 6-4-6 4-10ZM26 24l7 9-3 7-8-6 4-10Zm48 0l4 10-8 6-3-7 7-9ZM19 40l8 6-2 7-9-3 3-10Zm62 0l3 10-9 3-2-7 8-6ZM30 55h40l6 12-8 5H32l-8-5 6-12Zm-6 21h52l4 10H20l4-10Z",
  k: "M50 10h5v8h8v6h-8v7c9 3 15 11 15 21 0 6-2 11-6 15l3 9h5l4 10H30l4-10h5l3-9c-4-4-6-9-6-15 0-10 6-18 15-21v-7h-8v-6h8v-8Zm0 24c-7 0-12 6-12 13s5 13 12 13 12-6 12-13-5-13-12-13ZM24 84h52l4 10H20l4-10Z",
};

export default function PieceSVG({ type, palette, className }: PieceSVGProps) {
  const uid = useId();
  const gradId = `pg-${type}-${uid}`;
  const shadowId = `ps-${type}-${uid}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.primary} />
          <stop offset="100%" stopColor={palette.secondary} />
        </linearGradient>
        <filter id={shadowId} x="-30%" y="-10%" width="160%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="1.6" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>
      <path
        d={PATHS[type]}
        fill={`url(#${gradId})`}
        stroke={palette.outline}
        strokeWidth={2.5}
        strokeLinejoin="round"
        filter={`url(#${shadowId})`}
      />
    </svg>
  );
}
