/**
 * Circular ring showing the overall ESG score (0..100). Plain SVG rather than
 * a chart-lib primitive — a single ring doesn't need Recharts' axis/legend
 * machinery and this keeps full control over the design-system styling.
 */

const RADIUS = 70;
const STROKE_WIDTH = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ScoreRingProps {
  score: number;
}

export default function ScoreRing({ score }: ScoreRingProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={180} height={180} viewBox="0 0 180 180">
        <circle
          cx={90}
          cy={90}
          r={RADIUS}
          fill="none"
          stroke="rgba(57,123,64,0.10)"
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          cx={90}
          cy={90}
          r={RADIUS}
          fill="none"
          stroke="#397b40"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
        />
        <text
          x={90}
          y={84}
          textAnchor="middle"
          fontSize={36}
          fontWeight={700}
          fill="#1a2e1b"
          fontFamily="Plus Jakarta Sans, DM Sans, sans-serif"
        >
          {clamped.toFixed(1)}
        </text>
        <text
          x={90}
          y={108}
          textAnchor="middle"
          fontSize={12}
          fill="#6b7280"
          fontFamily="Plus Jakarta Sans, DM Sans, sans-serif"
        >
          Skor ESG
        </text>
      </svg>
    </div>
  );
}
