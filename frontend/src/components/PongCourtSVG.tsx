export function PongCourtSVG() {
  return (
    <svg
      viewBox="0 0 400 200"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      style={{
        maxWidth: 560,
        display: 'block',
        margin: '0 auto',
        background: "#050505",
        borderRadius: 12
      }}
    >
      <defs>
        <filter id="neon">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect
        x="2"
        y="2"
        width="396"
        height="196"
        rx="8"
        fill="none"
        stroke="#39ff14"
        strokeWidth="2"
        filter="url(#neon)"
      />

      {Array.from({ length: 10 }).map((_, i) => (
        <rect
          key={i}
          x="198"
          y={10 + i * 19}
          width="4"
          height="10"
          fill="#39ff14"
          opacity="0.4"
        />
      ))}

      <rect
        x="18"
        y="75"
        width="8"
        height="50"
        fill="#39ff14"
        filter="url(#neon)"
      />

      <rect
        x="374"
        y="75"
        width="8"
        height="50"
        fill="#39ff14"
        filter="url(#neon)"
      />

      <rect
        y="96"
        width="8"
        height="8"
        fill="#39ff14"
        filter="url(#neon)"
      >
        <animate
          attributeName="x"
          values="30;360;30"
          keyTimes="0;0.5;1"
          dur="3s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
        />
      </rect>
    </svg>
  );
}