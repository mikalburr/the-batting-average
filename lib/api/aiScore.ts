// AI Scoring Pipeline — uses Claude to generate first-pass sub-scores
// Requires: ANTHROPIC_API_KEY in env

import Anthropic from "@anthropic-ai/sdk";
import type { ArtistTier } from "@prisma/client";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface AIScoringInput {
  artistName: string;
  title: string;
  year: number;
  artistTier: ArtistTier;
  album?: string;
}

export interface AIScoredField {
  score: number;           // 0–100
  reasoning: string;       // one-line explanation
  confidence: "HIGH" | "MEDIUM" | "LOW";
}

export interface AIScoredSong {
  // Quality sub-scores
  lyricism:    AIScoredField | null;  // null if instrumental
  production:  AIScoredField;
  engineering: AIScoredField;
  creativity:  AIScoredField;
  performance: AIScoredField;
  // Cultural Impact sub-scores
  longevity:       AIScoredField;
  sample:          AIScoredField;
  critical:        AIScoredField;
  culturalMoment:  AIScoredField;
  peer:            AIScoredField;
  // Meta
  isInstrumental: boolean;
  notes: string;   // overall editorial note
}

const SYSTEM_PROMPT = `You are an expert music critic and data analyst for The Batting Average, a site that scores songs using a rigorous rubric.

SCORING RUBRIC:

QUALITY SUB-SCORES (rate each 0–100):
- lyricism: Wordplay, storytelling, technical skill, vocabulary, quotables. Skip (return null) for instrumentals.
- production: Beat construction, arrangement, sonic palette, instrumentation, sonics.
- engineering: Mix clarity, stereo field, frequency balance, mastering quality, how it translates on different speakers.
- creativity: Innovation, genre-pushing, distinctiveness, originality of concept, risks taken.
- performance: Vocal delivery, emotional conviction, breath control, cadence, chemistry with production.

CULTURAL IMPACT SUB-SCORES (rate each 0–100):
- longevity: Is it still played, referenced, covered? Does it hold up years later?
- sample: How many times has it been sampled or interpolated by other artists?
- critical: How did serious music criticism receive it? Metacritic/Pitchfork/AllMusic consensus.
- culturalMoment: Did it define a trend, era, movement, or cultural conversation?
- peer: Do other artists name it as an influence? Is it in their DNA?

SCORING GUIDELINES:
- 90–100: All-time classic in its dimension. Rare.
- 75–89: Excellent, standout work.
- 60–74: Good, above average.
- 45–59: Average for the genre.
- 30–44: Below average, notable weaknesses.
- 0–29: Poor execution of this dimension.

Be honest and nuanced. A song can have high production but low lyricism. Distinguish what the artist is known for vs. what this specific song delivers.

ARTIST TIER context (for perspective, not for inflating scores):
- SUPERSTAR: Beyoncé, Kendrick, Drake — commercial giants
- MAINSTREAM: J. Cole, Travis Scott, SZA — consistent sellers
- RISING: JID, Denzel Curry, Olivia Rodrigo — establishing themselves
- INDEPENDENT: Earl Sweatshirt, Armand Hammer — critically respected but niche
- UNDERGROUND: billy woods, Quelle Chris — cult followings, minimal commercial reach`;

export async function generateSongScores(input: AIScoringInput): Promise<AIScoredSong | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const prompt = `Score this song using the rubric:

Artist: ${input.artistName} (${input.artistTier})
Title: "${input.title}"
Year: ${input.year}${input.album ? `\nAlbum: ${input.album}` : ""}

Use the submit_scores tool to return all scores with reasoning and confidence levels.`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: [{
        name: "submit_scores",
        description: "Submit all sub-scores for the song",
        input_schema: {
          type: "object" as const,
          required: ["production", "engineering", "creativity", "performance",
                     "longevity", "sample", "critical", "culturalMoment", "peer",
                     "isInstrumental", "notes"],
          properties: {
            isInstrumental: { type: "boolean", description: "True if no vocals/rapping" },
            lyricism: {
              type: ["object", "null"],
              description: "null if instrumental",
              properties: {
                score: { type: "number", minimum: 0, maximum: 100 },
                reasoning: { type: "string" },
                confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
              },
            },
            production:  scoreFieldSchema("Beat construction, arrangement, sonic palette"),
            engineering: scoreFieldSchema("Mix clarity, depth, frequency balance"),
            creativity:  scoreFieldSchema("Innovation, originality, genre-pushing"),
            performance: scoreFieldSchema("Vocal delivery, conviction, cadence"),
            longevity:   scoreFieldSchema("Still played and referenced today"),
            sample:      scoreFieldSchema("Times sampled/interpolated by other artists"),
            critical:    scoreFieldSchema("Critical consensus (Pitchfork, AllMusic, Metacritic)"),
            culturalMoment: scoreFieldSchema("Defined a trend, era, or cultural conversation"),
            peer:        scoreFieldSchema("Peer influence and recognition from other artists"),
            notes:       { type: "string", description: "1-2 sentence editorial summary of the song" },
          },
        },
      }],
      tool_choice: { type: "tool", name: "submit_scores" },
      messages: [{ role: "user", content: prompt }],
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") return null;

    const raw = toolUse.input as Record<string, unknown>;

    return {
      lyricism:      raw.isInstrumental ? null : (raw.lyricism as AIScoredField),
      production:    raw.production    as AIScoredField,
      engineering:   raw.engineering   as AIScoredField,
      creativity:    raw.creativity    as AIScoredField,
      performance:   raw.performance   as AIScoredField,
      longevity:     raw.longevity     as AIScoredField,
      sample:        raw.sample        as AIScoredField,
      critical:      raw.critical      as AIScoredField,
      culturalMoment: raw.culturalMoment as AIScoredField,
      peer:          raw.peer          as AIScoredField,
      isInstrumental: raw.isInstrumental as boolean,
      notes:         raw.notes         as string,
    };
  } catch (err) {
    console.error("AI scoring failed:", err);
    return null;
  }
}

function scoreFieldSchema(description: string) {
  return {
    type: "object" as const,
    description,
    required: ["score", "reasoning", "confidence"],
    properties: {
      score:      { type: "number", minimum: 0, maximum: 100 },
      reasoning:  { type: "string" },
      confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
    },
  };
}
