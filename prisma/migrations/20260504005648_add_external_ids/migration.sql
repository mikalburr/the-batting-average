-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "mbid" TEXT,
ADD COLUMN     "spotifyId" TEXT;
