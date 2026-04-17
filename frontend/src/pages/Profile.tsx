import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { matchApi, type MatchDTO } from '../api/matches';

export function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [matches, setMatches] = useState<MatchDTO[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    matchApi
      .listMine()
      .then((data) => {
        if (!cancelled) setMatches(data.matches);
      })
      .catch(() => {
        if (!cancelled) setMatches([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-display text-2xl neon text-accent mb-2">
        &gt; PLAYER CARD
      </h1>
      <p className="font-body text-base text-muted mb-8">
        {t('profile.title').toUpperCase()}<span className="cursor-blink"></span>
      </p>

      <div className="arcade-panel font-body text-xl space-y-4">
        <div className="flex gap-4">
          <span className="text-accent-cyan w-48 uppercase font-display text-xs pt-1">
            {t('profile.username')}
          </span>
          <span className="text-text">{user.username}</span>
        </div>
        <div className="flex gap-4">
          <span className="text-accent-cyan w-48 uppercase font-display text-xs pt-1">
            {t('profile.email')}
          </span>
          <span className="text-text">{user.email}</span>
        </div>
        <div className="flex gap-4">
          <span className="text-accent-cyan w-48 uppercase font-display text-xs pt-1">
            {t('profile.userId')}
          </span>
          <span className="text-muted text-sm break-all">{user.id}</span>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg neon text-accent mb-4">
          &gt; MATCH HISTORY
        </h2>
        {loading ? (
          <p className="font-body text-muted">&gt; Loading…</p>
        ) : matches && matches.length > 0 ? (
          <div className="space-y-2">
            {matches.map((m) => (
              <MatchRow key={m.id} match={m} currentUserId={user.id} />
            ))}
          </div>
        ) : (
          <p className="font-body text-muted">
            &gt; No matches yet. <span className="text-accent-cyan">Play your first game!</span>
          </p>
        )}
      </div>
    </div>
  );
}

function MatchRow({ match, currentUserId }: { match: MatchDTO; currentUserId: string }) {
  const left = match.participants.find((p) => p.side === 'LEFT')!;
  const right = match.participants.find((p) => p.side === 'RIGHT')!;
  const currentSide = left.userId === currentUserId ? 'LEFT' : 'RIGHT';
  const userWon = currentSide === match.winnerSide;

  const minutes = Math.floor(match.durationMs / 60000);
  const seconds = Math.floor((match.durationMs % 60000) / 1000);
  const durationLabel = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const date = new Date(match.endedAt);
  const dateLabel = date.toLocaleDateString(undefined, {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });

  return (
    <div
      className="border-2 p-3 flex items-center gap-3 font-body"
      style={{
        borderColor: userWon ? '#39ff14' : '#2a2a3a',
        boxShadow: userWon ? '0 0 8px rgba(57, 255, 20, 0.25)' : 'none',
      }}
    >
      <span
        className="font-display text-xs px-2 py-1"
        style={{
          color: userWon ? '#39ff14' : '#ff2e63',
        }}
      >
        {userWon ? 'WIN' : 'LOSS'}
      </span>
      <span className="text-text flex-1">
        {left.alias} <span className="text-accent">{left.score}</span>
        {' — '}
        <span className="text-accent">{right.score}</span> {right.alias}
      </span>
      <span className="text-muted text-sm">{durationLabel}</span>
      <span className="text-muted text-sm">{dateLabel}</span>
    </div>
  );
}