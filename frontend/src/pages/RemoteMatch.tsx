import { useEffect, useRef, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useRemoteMatch } from '../game/pong/useRemoteMatch';
import { useRemoteCanvas } from '../game/pong/useRemoteCanvas';
import { useKeyboardInput } from '../game/pong/useKeyboardInput';
import { useKeyLabels } from '../game/pong/useKeyLabels';
import { remoteApi, type RemoteMatchDetail } from '../api/remote';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/pong/constants';
import { ApiException } from '../api/client';

export function RemoteMatch() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!id || !user) {
    return <Navigate to="/remote" replace />;
  }

  const [initialDetail, setInitialDetail] = useState<RemoteMatchDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const resolveMatch = async () => {
      try {
        const { match } = await remoteApi.get(id);
        if (cancelled) return;

        const isHost = match.host.username === user.username;
        const isGuest = match.guest?.username === user.username;

        if (isHost || isGuest) {
          setInitialDetail(match);
          return;
        }

        try {
          const { match: joined } = await remoteApi.join(id);
          if (!cancelled) setInitialDetail(joined);
        } catch (joinErr) {
          if (cancelled) return;
          if (joinErr instanceof ApiException) {
            if (joinErr.status === 409) {
              const existing = (joinErr.data as { matchId?: string }).matchId;
              if (existing && existing !== id) {
                setDetailError(
                  `You are already in another match. Leaving this one.`,
                );
                return;
              }
              setDetailError(joinErr.data.error);
              return;
            }
            setDetailError(joinErr.data.error);
          } else {
            setDetailError('Could not join the match');
          }
        }
      } catch {
        if (!cancelled) setDetailError('Match not found or expired');
      }
    };

    resolveMatch();

    return () => {
      cancelled = true;
    };
  }, [id, user.username]);

  if (detailError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="font-display text-lg text-danger mb-4">&gt; ERROR</p>
        <p className="font-body text-muted mb-6">{detailError}</p>
        <button
          onClick={() => navigate('/remote')}
          className="btn-arcade-primary"
        >
          &gt; BACK TO LOBBY
        </button>
      </div>
    );
  }

  if (!initialDetail) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="font-body text-muted">&gt; Loading match…</p>
      </div>
    );
  }

  return <RemoteMatchInner matchId={id} initial={initialDetail} />;
}

function RemoteMatchInner({
  matchId,
  initial,
}: {
  matchId: string;
  initial: RemoteMatchDetail;
}) {
  const navigate = useNavigate();
  const keys = useKeyLabels();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const remote = useRemoteMatch({ matchId });

  const inputRef = useKeyboardInput({
    onSpace: () => {
      if (remote.status === 'waiting_ready' || remote.status === 'opponent_ready') {
        if (!remote.iAmReady) remote.sendReady();
      }
    },
  });

  useEffect(() => {
    let frameId = 0;
    let lastSent = { up: false, down: false };

    const loop = () => {
      if (remote.status === 'playing' && remote.side) {
        const raw = inputRef.current;
        const up = remote.side === 'left' ? raw.leftUp : raw.rightUp;
        const down = remote.side === 'left' ? raw.leftDown : raw.rightDown;

        if (up !== lastSent.up || down !== lastSent.down) {
          remote.sendInput(up, down);
          lastSent = { up, down };
        }
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [remote.status, remote.side, remote.sendInput, remote.iAmReady, remote.sendReady, inputRef]);

  const leftAlias = initial.host.username;
  const rightAlias = remote.match?.guest?.username
    ?? initial.guest?.username
    ?? '...';

  useRemoteCanvas(canvasRef, {
    game: remote.game,
    theme: initial.settings.theme,
    aliases: { left: leftAlias, right: rightAlias },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-2xl neon text-accent mb-2 text-center">
        &gt; REMOTE PONG
      </h1>
      <p className="font-body text-base text-muted mb-2 text-center">
        {leftAlias.toUpperCase()} VS {rightAlias.toUpperCase()}
        <span className="cursor-blink"></span>
      </p>
      <p className="font-body text-sm text-muted text-center mb-8">
        {initial.settings.ballSpeed} BALL · {initial.settings.paddleSize} PADDLES ·
        {' '}FIRST TO {initial.settings.scoreToWin}
        {initial.settings.powerUpsEnabled && ' · POWER-UPS'}
      </p>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="block mx-auto border-2 border-accent max-w-full"
          style={{
            aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
            width: '100%',
            maxWidth: `${GAME_WIDTH}px`,
            maxHeight: '60vh',
            imageRendering: 'pixelated',
            boxShadow: '0 0 20px rgba(57, 255, 20, 0.4), inset 0 0 30px rgba(57, 255, 20, 0.1)',
          }}
        />
        <StatusOverlay remote={remote} />
      </div>

      <div className="mt-8 max-w-2xl mx-auto">
        <ActionArea remote={remote} keys={keys} matchId={matchId} onBack={() => navigate('/remote')} />
      </div>
    </div>
  );
}

function StatusOverlay({ remote }: { remote: ReturnType<typeof useRemoteMatch> }) {
  const { status, countdown, winner, finishReason, opponentConnected, side } = remote;

  if (status === 'playing' && opponentConnected) return null;

  let main = '';
  let sub = '';

  switch (status) {
    case 'connecting':
      main = 'CONNECTING…';
      break;
    case 'attaching':
      main = 'JOINING MATCH…';
      break;
    case 'waiting_opponent':
      main = 'WAITING FOR OPPONENT';
      sub = 'Share the URL or wait for someone to join';
      break;
    case 'waiting_ready':
      if (remote.iAmReady) {
        main = 'WAITING FOR OPPONENT';
        sub = 'You are ready — waiting for the other player';
      } else {
        main = 'READY ?';
        sub = 'Press SPACE when you are';
      }
      break;
    case 'opponent_ready':
      if (remote.iAmReady) {
        // Cas rare : les deux sont ready presque simultanément, on va bientôt voir le countdown
        main = 'STARTING…';
      } else {
        main = 'OPPONENT IS READY';
        sub = 'Press SPACE to start';
      }
      break;
    case 'countdown':
      main = countdown !== null ? String(countdown) : 'GO';
      break;
    case 'paused':
      main = 'PAUSED';
      sub = 'Opponent disconnected — 15s to return';
      break;
    case 'finished': {
      const youWon = winner === side;
      main = youWon ? 'YOU WIN' : 'YOU LOSE';
      sub = finishReason === 'opponent_timeout' ? '(OPPONENT FORFEIT)' : '';
      break;
    }
    case 'aborted':
      main = 'MATCH ABORTED';
      sub = finishReason ?? '';
      break;
    case 'disconnected':
      main = 'DISCONNECTED';
      sub = 'Lost connection to the server';
      break;
    default:
      return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center bg-bg/70 px-8 py-6 border-2 border-accent">
        <p className="font-display text-2xl text-accent neon mb-2">{main}</p>
        {sub && <p className="font-body text-sm text-muted">{sub}</p>}
      </div>
    </div>
  );
}

function ActionArea({
  remote,
  keys,
  matchId,
  onBack,
}: {
  remote: ReturnType<typeof useRemoteMatch>;
  keys: { leftUp: string; leftDown: string; rightUp: string; rightDown: string };
  matchId: string;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = `${window.location.origin}/remote/match/${matchId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const myUp = remote.side === 'left' ? keys.leftUp : keys.rightUp;
  const myDown = remote.side === 'left' ? keys.leftDown : keys.rightDown;

  if (remote.status === 'waiting_opponent') {
    return (
      <div className="arcade-panel text-center">
        <p className="font-display text-xs text-accent-cyan mb-3">INVITE A FRIEND</p>
        <button onClick={copyLink} className="btn-arcade-primary">
          {copied ? '> LINK COPIED' : '> COPY INVITE LINK'}
        </button>
        <p className="font-body text-sm text-muted mt-4">
          Or wait for someone to join from the lobby.
        </p>
        <button
          onClick={onBack}
          className="font-body text-base text-muted hover:text-accent uppercase mt-4 block mx-auto"
        >
          &lt; back to lobby
        </button>
      </div>
    );
  }

  if (remote.status === 'waiting_ready' || remote.status === 'opponent_ready') {
    return (
      <div className="arcade-panel text-center">
        {remote.iAmReady ? (
          <>
            <p className="font-display text-xs text-accent-cyan mb-4">
              YOU ARE READY
            </p>
            <p className="font-body text-sm text-muted">
              Waiting for {remote.status === 'opponent_ready' ? 'start…' : 'opponent…'}
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-xs text-accent-cyan mb-4">
              PRESS SPACE WHEN READY
            </p>
            <button onClick={remote.sendReady} className="btn-arcade-primary">
              &gt; I&apos;M READY
            </button>
          </>
        )}
      </div>
    );
  }

  if (remote.status === 'playing' || remote.status === 'countdown' || remote.status === 'paused') {
    return (
      <div className="arcade-panel text-center">
        <p className="font-display text-xs text-accent-cyan mb-4">YOUR CONTROLS</p>
        <div className="flex justify-center gap-4 items-center">
          <span className="inline-flex items-center justify-center border-2 border-accent text-accent font-display"
            style={{ minWidth: '3rem', height: '3rem', padding: '0 0.75rem', fontSize: myUp.length > 1 ? '0.75rem' : '1rem' }}>
            {myUp}
          </span>
          <span className="font-body text-muted">UP</span>
          <span className="inline-flex items-center justify-center border-2 border-accent text-accent font-display ml-6"
            style={{ minWidth: '3rem', height: '3rem', padding: '0 0.75rem', fontSize: myDown.length > 1 ? '0.75rem' : '1rem' }}>
            {myDown}
          </span>
          <span className="font-body text-muted">DOWN</span>
        </div>
      </div>
    );
  }

  if (remote.status === 'finished' || remote.status === 'aborted' || remote.status === 'disconnected') {
    return (
      <div className="text-center">
        <button onClick={onBack} className="btn-arcade-primary">
          &gt; BACK TO LOBBY
        </button>
      </div>
    );
  }

  return null;
}