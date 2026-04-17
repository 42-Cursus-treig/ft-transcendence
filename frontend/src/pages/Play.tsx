import { PongCanvas } from '../game/pong/PongCanvas';
import { useKeyLabels } from '../game/pong/useKeyLabels';

export function Play() {
  const keys = useKeyLabels();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-2xl neon text-accent mb-2 text-center">
        &gt; PONG
      </h1>
      <p className="font-body text-base text-muted mb-8 text-center">
        LOCAL MATCH — 2 PLAYERS<span className="cursor-blink"></span>
      </p>

      <PongCanvas />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <ControlsCard
          label="LEFT PLAYER"
          upKey={keys.leftUp}
          downKey={keys.leftDown}
        />
        <ControlsCard
          label="RIGHT PLAYER"
          upKey={keys.rightUp}
          downKey={keys.rightDown}
        />
      </div>

      <p className="font-body text-base text-muted text-center mt-6">
        &gt; SPACE = START / PAUSE &nbsp;·&nbsp; FIRST TO 5 WINS
        <span className="cursor-blink"></span>
      </p>
    </div>
  );
}

function ControlsCard({
  label,
  upKey,
  downKey,
}: {
  label: string;
  upKey: string;
  downKey: string;
}) {
  return (
    <div className="arcade-panel text-center">
      <p className="font-display text-xs text-accent-cyan mb-4">{label}</p>
      <div className="flex flex-col items-center gap-2">
        <KeyCap label={upKey} />
        <KeyCap label={downKey} />
      </div>
    </div>
  );
}

function KeyCap({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center justify-center border-2 border-accent text-accent font-display"
      style={{
        minWidth: '3rem',
        height: '3rem',
        padding: '0 0.75rem',
        fontSize: label.length > 1 ? '0.75rem' : '1rem',
        boxShadow:
          '0 0 8px rgba(57, 255, 20, 0.4), inset 0 0 8px rgba(57, 255, 20, 0.15)',
        lineHeight: 1,
      }}
    >
      {label}
    </span>
  );
}