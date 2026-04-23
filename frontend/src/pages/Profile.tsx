import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { matchApi, type MatchDTO, type Pagination } from '../api/matches';

const PAGE_SIZE = 10;

export function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [matches, setMatches] = useState<MatchDTO[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    matchApi
      .listMine(page, PAGE_SIZE)
      .then((data) => {
        if (cancelled) return;
        setMatches(data.matches);
        setPagination(data.pagination);
      })
      .catch(() => {
        if (!cancelled) {
          setMatches([]);
          setPagination(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
      <h1 className="font-display text-xl sm:text-2xl neon text-accent mb-2">
        &gt; {t('profile.title').toUpperCase()}
      </h1>
      <p className="font-body text-base text-muted mb-8">
        {t('profile.title').toUpperCase()}<span className="cursor-blink"></span>
      </p>

      <div className="arcade-panel font-body text-lg sm:text-xl space-y-4">
        <ProfileRow label={t('profile.username')} value={user.username} />
        <ProfileRow label={t('profile.email')} value={user.email} />
        <ProfileRow label={t('profile.userId')} value={user.id} small />
      </div>

      <div className="mt-10">
        <div className="flex justify-between items-baseline mb-4 gap-2">
          <h2 className="font-display text-base sm:text-lg neon text-accent">
            &gt; {t('profile.matchHistory').toUpperCase()}
          </h2>
          {pagination && pagination.total > 0 && (
            <span className="font-body text-sm text-muted shrink-0">
              {t('profile.matchCount', { count: pagination.total })}
            </span>
          )}
        </div>

        {loading ? (
          <p className="font-body text-muted">&gt; {t('common.loading')}</p>
        ) : matches && matches.length > 0 ? (
          <>
            <div className="space-y-2">
              {matches.map((m) => (
                <MatchRow key={m.id} match={m} currentUserId={user.id} t={t} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <PaginationControls
                pagination={pagination}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => p + 1)}
                t={t}
              />
            )}
          </>
        ) : (
          <p className="font-body text-muted">
            &gt; {t('profile.noMatches')}{' '}
            <span className="text-accent-cyan">{t('profile.playFirstGame')}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function ProfileRow({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 gap-1">
      <span className="text-accent-cyan sm:w-48 uppercase font-display text-xs shrink-0">
        {label}
      </span>
      <span className={small ? 'text-muted text-sm break-all' : 'text-text break-all'}>
        {value}
      </span>
    </div>
  );
}

function PaginationControls({
  pagination,
  onPrev,
  onNext,
  t,
}: {
  pagination: Pagination;
  onPrev: () => void;
  onNext: () => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const isFirstPage = pagination.page === 1;
  const isLastPage = !pagination.hasMore;

  return (
    <div className="mt-6 flex items-center justify-between font-body gap-2">
      <button
        onClick={onPrev}
        disabled={isFirstPage}
        className={`btn-arcade text-sm ${
          isFirstPage
            ? 'opacity-40 cursor-not-allowed border-muted text-muted'
            : 'border-accent text-accent hover:bg-accent hover:text-bg'
        }`}
      >
        &lt; {t('common.previous')}
      </button>

      <span className="font-display text-xs text-muted text-center">
        {t('common.pageOfTotal', {
          current: pagination.page,
          total: pagination.totalPages,
        })}
      </span>

      <button
        onClick={onNext}
        disabled={isLastPage}
        className={`btn-arcade text-sm ${
          isLastPage
            ? 'opacity-40 cursor-not-allowed border-muted text-muted'
            : 'border-accent text-accent hover:bg-accent hover:text-bg'
        }`}
      >
        {t('common.next')} &gt;
      </button>
    </div>
  );
}

function MatchRow({
  match,
  currentUserId,
  t,
}: {
  match: MatchDTO;
  currentUserId: string;
  t: (key: string) => string;
}) {
  const left = match.participants.find((p) => p.side === 'LEFT')!;
  const right = match.participants.find((p) => p.side === 'RIGHT')!;
  const currentSide = left.userId === currentUserId ? 'LEFT' : 'RIGHT';
  const userWon = currentSide === match.winnerSide;

  const minutes = Math.floor(match.durationMs / 60000);
  const seconds = Math.floor((match.durationMs % 60000) / 1000);
  const durationLabel = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const date = new Date(match.endedAt);
  const dateLabel = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <div
      className="border-2 p-3 font-body"
      style={{
        borderColor: userWon ? '#39ff14' : '#2a2a3a',
        boxShadow: userWon ? '0 0 8px rgba(57, 255, 20, 0.25)' : 'none',
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="font-display text-xs px-2 py-1 shrink-0"
          style={{ color: userWon ? '#39ff14' : '#ff2e63' }}
        >
          {userWon ? t('profile.win') : t('profile.loss')}
        </span>
        <span className="text-text flex-1 text-sm sm:text-base truncate">
          {left.alias}{' '}
          <span className="text-accent">{left.score}</span>
          {' — '}
          <span className="text-accent">{right.score}</span>{' '}
          {right.alias}
        </span>
      </div>
      <div className="flex gap-4 mt-1 pl-2 font-body text-xs text-muted">
        <span>{durationLabel}</span>
        <span>{dateLabel}</span>
      </div>
    </div>
  );
}