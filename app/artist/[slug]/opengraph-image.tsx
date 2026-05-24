import { ImageResponse } from "next/og";
import { getArtistBySlug } from "@/lib/db/artists";
import { fmtAvg } from "@/lib/scoring/format";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TIER_COLORS: Record<string, string> = {
  CLASSIC: "#FFD700",
  GREAT: "#00E5B0",
  GOOD: "#4CAF50",
  MID: "#A0A0A0",
  SKIP: "#FF4444",
};

const TIER_LABEL: Record<string, string> = {
  CLASSIC: "CLASSIC",
  GREAT: "GREAT",
  GOOD: "GOOD",
  MID: "MID",
  SKIP: "SKIP",
};

export default async function Image({ params }: { params: { slug: string } }) {
  const notFoundImage = new ImageResponse(
    <div style={{ background: "#0a0a0a", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#555", fontSize: 32 }}>Not found</span>
    </div>,
    { width: 1200, height: 630 }
  );

  let artist;
  try {
    artist = await getArtistBySlug(params.slug);
  } catch {
    return notFoundImage;
  }
  if (!artist) return notFoundImage;

  // Derive artist's dominant tier from avg
  let tierKey: string | null = null;
  if (artist.avg != null) {
    const avg = artist.avg;
    if (avg >= 0.8) tierKey = "CLASSIC";
    else if (avg >= 0.65) tierKey = "GREAT";
    else if (avg >= 0.55) tierKey = "GOOD";
    else if (avg >= 0.4) tierKey = "MID";
    else tierKey = "SKIP";
  }

  const tierColor = tierKey ? (TIER_COLORS[tierKey] ?? "#555") : "#555";
  const avg = artist.avg != null ? fmtAvg(artist.avg) : "—";
  const songCount = artist.allSongs.length;

  return new ImageResponse(
    <div
      style={{
        background: "#0a0a0a",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "64px",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Tier accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: tierColor,
        }}
      />

      {/* Top metadata */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        {tierKey && (
          <span
            style={{
              background: `${tierColor}22`,
              border: `1px solid ${tierColor}88`,
              color: tierColor,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 3,
              padding: "4px 12px",
              borderRadius: 4,
            }}
          >
            {TIER_LABEL[tierKey]}
          </span>
        )}
        <span style={{ color: "#555", fontSize: 14, letterSpacing: 2 }}>
          {artist.artistTier}
        </span>
      </div>

      {/* Artist name */}
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: "#e0e0e0",
          lineHeight: 1,
          letterSpacing: 2,
          textTransform: "uppercase",
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          paddingTop: 8,
        }}
      >
        {artist.name}
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ color: "#555", fontSize: 20 }}>
            {songCount} {songCount === 1 ? "song" : "songs"} rated
          </span>
          <span style={{ color: "#333", fontSize: 16, letterSpacing: 2, marginTop: 12 }}>
            THE BATTING AVERAGE
          </span>
        </div>

        {/* Batting average */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 120,
              fontWeight: 700,
              color: tierColor,
              lineHeight: 1,
              letterSpacing: -2,
            }}
          >
            {avg}
          </span>
          <span style={{ color: "#555", fontSize: 16, letterSpacing: 2, marginTop: 4 }}>
            ARTIST BATTING AVG
          </span>
        </div>
      </div>
    </div>,
    { ...size }
  );
}
