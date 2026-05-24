// Wikidata SPARQL API — free, no auth
// Used for: peak chart positions (P1352), RIAA certs (P2235), release data

const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";
const UA = "TheBattingAverage/1.0 (thebattingaverage.app)";

async function sparql<T>(query: string): Promise<T | null> {
  try {
    const res = await fetch(`${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`, {
      headers: { "User-Agent": UA, Accept: "application/sparql-results+json" },
    });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

interface SparqlBinding {
  value: string;
  type: string;
}

interface SparqlResult {
  results: {
    bindings: Record<string, SparqlBinding>[];
  };
}

// RIAA certification levels mapped from Wikidata cert strings
const CERT_MAP: Record<string, string> = {
  "diamond":             "DIAMOND",
  "10x platinum":        "DIAMOND",
  "5x platinum":         "FIVE_PLAT",
  "4x platinum":         "FOUR_PLAT",
  "3x platinum":         "THREE_PLAT",
  "2x platinum":         "TWO_PLAT",
  "platinum":            "PLAT",
  "gold":                "GOLD",
};

function parseCert(raw: string): string | null {
  const lower = raw.toLowerCase();
  for (const [key, val] of Object.entries(CERT_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

export interface WikidataSongData {
  peakChartPosition?: number;
  certificationLevel?: string;
  certSource?: string;  // e.g. "RIAA" or "BPI"
}

export async function getSongData(artist: string, title: string): Promise<WikidataSongData | null> {
  // Search Wikidata for a song matching artist + title
  const query = `
SELECT ?song ?songLabel ?chartPos ?certLabel WHERE {
  ?song wdt:P31 wd:Q7366 ;
        rdfs:label ?songLabel .
  FILTER(LANG(?songLabel) = "en")
  FILTER(CONTAINS(LCASE(?songLabel), "${title.toLowerCase().replace(/"/g, "")}"))

  OPTIONAL {
    ?song p:P1352 ?chartStmt .
    ?chartStmt ps:P1352 ?chartPos .
    ?chartStmt pq:P2598 ?chart .
    ?chart rdfs:label ?chartLabel .
    FILTER(LANG(?chartLabel) = "en")
    FILTER(CONTAINS(LCASE(?chartLabel), "hot 100") || CONTAINS(LCASE(?chartLabel), "billboard"))
  }

  OPTIONAL {
    ?song p:P2235 ?certStmt .
    ?certStmt ps:P2235 ?cert .
    ?cert rdfs:label ?certLabel .
    FILTER(LANG(?certLabel) = "en")
  }
}
LIMIT 5
`;

  const data = await sparql<SparqlResult>(query);
  if (!data?.results?.bindings?.length) return null;

  const result: WikidataSongData = {};

  for (const row of data.results.bindings) {
    if (row.chartPos && !result.peakChartPosition) {
      const pos = parseInt(row.chartPos.value, 10);
      if (!isNaN(pos)) result.peakChartPosition = pos;
    }
    if (row.certLabel && !result.certificationLevel) {
      const cert = parseCert(row.certLabel.value);
      if (cert) {
        result.certificationLevel = cert;
        result.certSource = "RIAA";
      }
    }
  }

  return Object.keys(result).length ? result : null;
}

export interface WikidataArtistData {
  mbid?: string;
  country?: string;
  genres?: string[];
}

export async function getArtistData(name: string): Promise<WikidataArtistData | null> {
  const query = `
SELECT ?artist ?mbid ?countryLabel WHERE {
  ?artist wdt:P31 wd:Q5 ;
          rdfs:label "${name}"@en .
  OPTIONAL { ?artist wdt:P434 ?mbid . }
  OPTIONAL {
    ?artist wdt:P27 ?country .
    ?country rdfs:label ?countryLabel .
    FILTER(LANG(?countryLabel) = "en")
  }
}
LIMIT 1
`;

  const data = await sparql<SparqlResult>(query);
  const row = data?.results?.bindings?.[0];
  if (!row) return null;

  return {
    mbid: row.mbid?.value,
    country: row.countryLabel?.value,
  };
}
