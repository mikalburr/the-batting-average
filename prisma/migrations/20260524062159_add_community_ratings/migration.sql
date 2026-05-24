-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "communityAvg" DOUBLE PRECISION,
ADD COLUMN     "communityCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "production_score" SET DEFAULT 0,
ALTER COLUMN "engineering_score" SET DEFAULT 0,
ALTER COLUMN "creativity_score" SET DEFAULT 0,
ALTER COLUMN "performance_score" SET DEFAULT 0,
ALTER COLUMN "longevity_score" SET DEFAULT 0,
ALTER COLUMN "sample_score" SET DEFAULT 0,
ALTER COLUMN "critical_score" SET DEFAULT 0,
ALTER COLUMN "cultural_moment_score" SET DEFAULT 0,
ALTER COLUMN "peer_score" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "lyricism_score" DOUBLE PRECISION,
    "production_score" DOUBLE PRECISION,
    "engineering_score" DOUBLE PRECISION,
    "creativity_score" DOUBLE PRECISION,
    "performance_score" DOUBLE PRECISION,
    "longevity_score" DOUBLE PRECISION,
    "sample_score" DOUBLE PRECISION,
    "critical_score" DOUBLE PRECISION,
    "cultural_moment_score" DOUBLE PRECISION,
    "peer_score" DOUBLE PRECISION,
    "composite_score" DOUBLE PRECISION,
    "batting_avg" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserRating_songId_idx" ON "UserRating"("songId");

-- CreateIndex
CREATE INDEX "UserRating_userId_idx" ON "UserRating"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRating_userId_songId_key" ON "UserRating"("userId", "songId");

-- AddForeignKey
ALTER TABLE "UserRating" ADD CONSTRAINT "UserRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRating" ADD CONSTRAINT "UserRating_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
