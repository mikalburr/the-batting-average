import { ImageResponse } from "next/og";
import { getSongBySlug } from "@/lib/db/songs";
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

export default async function Image({ params }: { params: { slug: string } }) {
  const notFoundImage = new ImageResponse(
    <div style={{ background: "#0a0a0a", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#555", fontSize: 32 }}>Not found</span>
    </div>,
    { width: 1200, height: 630 }
  );

  let song;
  try {
    song = await getSongBySlug(params.slug);
  } catch {
    return notFoundImage;
  }
  if (!song) return notFoundImage;

  const tierColor = song.tier ? (TIER_COLORS[song.tier] ?? "#555") : "#555";
  const avg = song.batting_avg != null ? fmtAvg(song.batting_avg) : "—";

  let bebasFont: ArrayBuffer | undefined;
  try {
    const res = await fetch("https://fonts.gstatic.com/s/bebasneuepro/v3/fC1MPZJEZG-e9gHhdI4-NBbfd0fl.woff2");
    bebasFont = await res.arrayBuffer();
  } catch {
    // font unavailable — fall back to system font
  }

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

      {/* Tier badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
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
          {song.tier ?? "UNRATED"}
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 88,
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
        {song.title}
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
          <span style={{ color: "#e0e0e0", fontSize: 28, fontWeight: 600 }}>
            {song.primaryArtist.name}
          </span>
          <span style={{ color: "#555", fontSize: 20 }}>{song.year}</span>
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
            BATTING AVG
          </span>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: bebasFont
        ? [{ name: "Bebas Neue Pro", data: bebasFont, weight: 700 }]
        : [],
    }
  );
}
