-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('PONG');

-- CreateEnum
CREATE TYPE "MatchMode" AS ENUM ('LOCAL', 'AI', 'REMOTE_1V1', 'TOURNAMENT');

-- CreateEnum
CREATE TYPE "Side" AS ENUM ('LEFT', 'RIGHT');

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL DEFAULT 'PONG',
    "mode" "MatchMode" NOT NULL,
    "winnerSide" "Side" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_participants" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT,
    "alias" TEXT NOT NULL,
    "side" "Side" NOT NULL,
    "score" INTEGER NOT NULL,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "match_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "matches_endedAt_idx" ON "matches"("endedAt");

-- CreateIndex
CREATE INDEX "match_participants_matchId_idx" ON "match_participants"("matchId");

-- CreateIndex
CREATE INDEX "match_participants_userId_idx" ON "match_participants"("userId");

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
