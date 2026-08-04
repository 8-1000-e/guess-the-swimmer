-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('playing', 'solved', 'validated', 'expired');

-- CreateTable
CREATE TABLE "Swimmer" (
    "login" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Swimmer_pkey" PRIMARY KEY ("login")
);

-- CreateTable
CREATE TABLE "User" (
    "ftId" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ftPfpUrl" TEXT,
    "campus" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "totalTryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("ftId")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "ftId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "targetLogin" TEXT NOT NULL,
    "assignedOn" DATE NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'playing',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "signToken" TEXT,
    "signTokenExpiresAt" TIMESTAMP(3),
    "solvedAt" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guess" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_ftId_idx" ON "RefreshToken"("ftId");

-- CreateIndex
CREATE UNIQUE INDEX "Round_signToken_key" ON "Round"("signToken");

-- CreateIndex
CREATE INDEX "Round_playerId_status_idx" ON "Round"("playerId", "status");

-- CreateIndex
CREATE INDEX "Round_targetLogin_status_idx" ON "Round"("targetLogin", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Round_playerId_assignedOn_key" ON "Round"("playerId", "assignedOn");

-- CreateIndex
CREATE INDEX "Guess_roundId_createdAt_idx" ON "Guess"("roundId", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_login_fkey" FOREIGN KEY ("login") REFERENCES "Swimmer"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_ftId_fkey" FOREIGN KEY ("ftId") REFERENCES "User"("ftId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("ftId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_targetLogin_fkey" FOREIGN KEY ("targetLogin") REFERENCES "Swimmer"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;
