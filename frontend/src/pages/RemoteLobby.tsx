import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { remoteApi, type RemoteMatchSummary } from '../api/remote';
import { ApiException } from '../api/client';
import { DEFAULT_SETTINGS, type GameSettings } from '../game/pong/settings';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { useAuth } from '../auth/AuthContext';

const REFRESH_INTERVAL_MS = 4000;

export function RemoteLobby() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matches, setMatches] = useState<RemoteMatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [settings] = useSessionStorage<GameSettings>(
    'pong.setup.settings',
    DEFAULT_SETTINGS,
  );

  useEffect(() => {
    let cancelled = false;

    const fetchMatches = async () => {
      try {
        const { matches } = await remoteApi.list();
        if (!cancelled) {
          setMatches(matches);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleCreate = async () => {
    setError('');
    setCreating(true);
    try {
      const { match } = await remoteApi.create(settings);
      navigate(`/remote/match/${match.id}`);
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.status === 409) {
          const existingId = (err.data as { matchId?: string }).matchId;
          if (existingId) {
            navigate(`/remote/match/${existingId}`);
            return;
          }
        }
        setError(err.data.error);
      } else {
        setError('Could not create match');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (matchId: string) => {
    setError('');
    try {
      await remoteApi.join(matchId);
      navigate(`/remote/match/${matchId}`);
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.status === 409) {
          const existingId = (err.data as { matchId?: string }).matchId;
          if (existingId && existingId !== matchId) {
            navigate(`/remote/match/${existingId}`);
            return;
          }
        }
        setError(err.data.error);
      } else {
        setError('Could not join match');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-2xl neon text-accent mb-2">
        &gt; REMOTE LOBBY
      </h1>
      <p className="font-body text-base text-muted mb-8">
        PLAY AGAINST ANOTHER HUMAN OVER THE NETWORK
        <span className="cursor-blink"></span>
      </p>

      <div className="arcade-panel mb-8">
        <p className="font-display text-xs text-accent-cyan mb-3">HOST A MATCH</p>
        <p className="font-body text-base text-muted mb-4">
          Settings will use your current customization from /play.
          Share the invite link with a friend or wait for someone to join from the lobby.
        </p>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="btn-arcade-primary"
        >
          {creating ? '> CREATING…' : '> CREATE MATCH'}
        </button>
      </div>

      <div>
        <p className="font-display text-xs text-accent-cyan mb-4">OPEN MATCHES</p>
        {loading ? (
          <p className="font-body text-muted">&gt; Loading…</p>
        ) : matches.length === 0 ? (
          <p className="font-body text-muted">
            &gt; No open matches.
            <span className="text-accent-cyan"> Be the first to host!</span>
          </p>
        ) : (
          <div className="space-y-2">
            {matches.map((m) => (
              <MatchRow
                key={m.id}
                match={m}
                onJoin={() => handleJoin(m.id)}
                disabled={m.hostUsername === user.username}
              />
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-danger font-body text-base mt-6">&gt; ERR: {error}</p>
      )}
    </div>
  );
}

function MatchRow({
  match,
  onJoin,
  disabled,
}: {
  match: RemoteMatchSummary;
  onJoin: () => void;
  disabled: boolean;
}) {
  return (
    <div className="border-2 border-border p-3 flex items-center gap-3 font-body">
      <span className="text-accent font-display text-xs">
        {match.hostUsername.toUpperCase()}
      </span>
      <span className="text-muted text-sm flex-1">
        {match.settings.ballSpeed} · {match.settings.paddleSize} ·
        {' '}FIRST TO {match.settings.scoreToWin}
        {match.settings.powerUpsEnabled && ' · POWER-UPS'}
      </span>
      <button
        onClick={onJoin}
        disabled={disabled}
        className="btn-arcade-primary"
      >
        {disabled ? '> YOUR MATCH' : '> JOIN'}
      </button>
    </div>
  );
}