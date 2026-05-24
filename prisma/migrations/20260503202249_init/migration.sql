-- CreateEnum
CREATE TYPE "ArtistTier" AS ENUM ('SUPERSTAR', 'MAINSTREAM', 'RISING', 'INDEPENDENT', 'UNDERGROUND');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('CLASSIC', 'GREAT', 'GOOD', 'MID', 'SKIP');

-- CreateEnum
CREATE TYPE "CertLevel" AS ENUM ('DIAMOND', 'FIVE_PLAT', 'FOUR_PLAT', 'THREE_PLAT', 'TWO_PLAT', 'PLAT', 'GOLD', 'NONE');

-- CreateEnum
CREATE TYPE "ViralityDurability" AS ENUM ('LASTING', 'FADED', 'SLOW_BURN');

-- CreateEnum
CREATE TYPE "CreditRole" AS ENUM ('PRODUCER', 'ENGINEER', 'SONGWRITER', 'FEATURE', 'VOCALIST');

-- CreateEnum
CREATE TYPE "ChartName" AS ENUM ('HOT_100', 'R_B_HIP_HOP', 'RAP', 'REGIONAL');

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "bio" TEXT,
    "era" TEXT,
    "artistTier" "ArtistTier" NOT NULL,
    "labelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "artistId" TEXT NOT NULL,
    "avgScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "albumId" TEXT,
    "primaryArtistId" TEXT NOT NULL,
    "lyricism_score" DOUBLE PRECISION,
    "production_score" DOUBLE PRECISION NOT NULL,
    "engineering_score" DOUBLE PRECISION NOT NULL,
    "creativity_score" DOUBLE PRECISION NOT NULL,
    "performance_score" DOUBLE PRECISION NOT NULL,
    "longevity_score" DOUBLE PRECISION NOT NULL,
    "sample_score" DOUBLE PRECISION NOT NULL,
    "critical_score" DOUBLE PRECISION NOT NULL,
    "cultural_moment_score" DOUBLE PRECISION NOT NULL,
    "peer_score" DOUBLE PRECISION NOT NULL,
    "track_number" INTEGER,
    "lifetime_streams" BIGINT NOT NULL DEFAULT 0,
    "peak_chart_position" INTEGER,
    "chart_name" "ChartName",
    "certification_level" "CertLevel",
    "physical_sales" INTEGER,
    "digital_sales" INTEGER,
    "tiktok_video_count" INTEGER,
    "platform_trend_peaks" INTEGER,
    "ugc_volume" INTEGER,
    "stream_spike_post_viral" BOOLEAN NOT NULL DEFAULT false,
    "search_volume_surge" BOOLEAN NOT NULL DEFAULT false,
    "sync_placement_count" INTEGER NOT NULL DEFAULT 0,
    "virality_durability" "ViralityDurability" NOT NULL DEFAULT 'LASTING',
    "quality_score_calc" DOUBLE PRECISION,
    "cultural_impact_calc" DOUBLE PRECISION,
    "commercial_score_calc" DOUBLE PRECISION,
    "composite_score" DOUBLE PRECISION,
    "batting_avg" DOUBLE PRECISION,
    "tier" "Tier",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "role" "CreditRole" NOT NULL,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongCredit" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "creditId" TEXT NOT NULL,

    CONSTRAINT "SongCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Artist_slug_key" ON "Artist"("slug");

-- CreateIndex
CREATE INDEX "Artist_artistTier_idx" ON "Artist"("artistTier");

-- CreateIndex
CREATE INDEX "Artist_labelId_idx" ON "Artist"("labelId");

-- CreateIndex
CREATE UNIQUE INDEX "Album_slug_key" ON "Album"("slug");

-- CreateIndex
CREATE INDEX "Album_artistId_idx" ON "Album"("artistId");

-- CreateIndex
CREATE INDEX "Album_year_idx" ON "Album"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Song_slug_key" ON "Song"("slug");

-- CreateIndex
CREATE INDEX "Song_primaryArtistId_idx" ON "Song"("primaryArtistId");

-- CreateIndex
CREATE INDEX "Song_albumId_idx" ON "Song"("albumId");

-- CreateIndex
CREATE INDEX "Song_year_idx" ON "Song"("year");

-- CreateIndex
CREATE INDEX "Song_batting_avg_idx" ON "Song"("batting_avg");

-- CreateIndex
CREATE INDEX "Song_tier_idx" ON "Song"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "Credit_slug_key" ON "Credit"("slug");

-- CreateIndex
CREATE INDEX "Credit_role_idx" ON "Credit"("role");

-- CreateIndex
CREATE INDEX "SongCredit_creditId_idx" ON "SongCredit"("creditId");

-- CreateIndex
CREATE UNIQUE INDEX "SongCredit_songId_creditId_key" ON "SongCredit"("songId", "creditId");

-- CreateIndex
CREATE UNIQUE INDEX "Label_slug_key" ON "Label"("slug");

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_primaryArtistId_fkey" FOREIGN KEY ("primaryArtistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongCredit" ADD CONSTRAINT "SongCredit_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongCredit" ADD CONSTRAINT "SongCredit_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Credit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
