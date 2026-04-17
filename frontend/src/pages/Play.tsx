import { useTranslation } from 'react-i18next';
import { PongCanvas } from '../game/pong/PongCanvas';

export function Play() {
  const { t } = useTranslation();

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
        <div className="arcade-panel text-center">
          <p className="font-display text-xs text-accent-cyan mb-3">LEFT PLAYER</p>
          <p className="font-body text-xl">
            <span className="text-accent">W</span> / <span className="text-accent">S</span>
          </p>
        </div>
        <div className="arcade-panel text-center">
          <p className="font-display text-xs text-accent-cyan mb-3">RIGHT PLAYER</p>
          <p className="font-body text-xl">
            <span className="text-accent">↑</span> / <span className="text-accent">↓</span>
          </p>
        </div>
      </div>

      <p className="font-body text-base text-muted text-center mt-6">
        &gt; FIRST TO 5 POINTS WINS<span className="cursor-blink"></span>
      </p>
    </div>
  );
}