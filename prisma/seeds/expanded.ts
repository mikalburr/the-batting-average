// Expanded seed data — Classic Hip-Hop, R&B/Neo-Soul, Pop, Alternative, UK
// Sub-scores are left at 0 — the AI scoring batch will fill them in after seeding

import type { PrismaClient } from "@prisma/client";

function slug(name: string) {
  return name.toLowerCase().replace(/['']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function seedExpanded(prisma: PrismaClient) {
  console.log("\n📀 Seeding expanded catalog...");

  // ─── Labels ────────────────────────────────────────────────────────────────
  const labels = await Promise.all([
    prisma.label.upsert({ where: { slug: "columbia-records" }, update: {}, create: { name: "Columbia Records", slug: "columbia-records" } }),
    prisma.label.upsert({ where: { slug: "def-jam-recordings" }, update: {}, create: { name: "Def Jam Recordings", slug: "def-jam-recordings" } }),
    prisma.label.upsert({ where: { slug: "columbia-records-classic" }, update: {}, create: { name: "Columbia Records", slug: "columbia-records-classic" } }),
    prisma.label.upsert({ where: { slug: "interscope-records" }, update: {}, create: { name: "Interscope Records", slug: "interscope-records" } }),
    prisma.label.upsert({ where: { slug: "xo-records" }, update: {}, create: { name: "XO Records", slug: "xo-records" } }),
    prisma.label.upsert({ where: { slug: "island-records" }, update: {}, create: { name: "Island Records", slug: "island-records" } }),
    prisma.label.upsert({ where: { slug: "noname-label" }, update: {}, create: { name: "No Name", slug: "noname-label" } }),
    prisma.label.upsert({ where: { slug: "universal-music" }, update: {}, create: { name: "Universal Music Group", slug: "universal-music" } }),
    prisma.label.upsert({ where: { slug: "emi-records" }, update: {}, create: { name: "EMI Records", slug: "emi-records" } }),
    prisma.label.upsert({ where: { slug: "xl-recordings" }, update: {}, create: { name: "XL Recordings", slug: "xl-recordings" } }),
    prisma.label.upsert({ where: { slug: "ago-records" }, update: {}, create: { name: "AGO Records", slug: "ago-records" } }),
    prisma.label.upsert({ where: { slug: "brainfeeder" }, update: {}, create: { name: "Brainfeeder", slug: "brainfeeder" } }),
    prisma.label.upsert({ where: { slug: "anti-records" }, update: {}, create: { name: "ANTI- Records", slug: "anti-records" } }),
  ]);

  const [columbia, defJam, , interscope, xo, island, , universal, emi, xl, ago, brainfeeder, anti] = labels;

  // ─── Artists ───────────────────────────────────────────────────────────────
  const artistData = [
    // Classic Hip-Hop
    { name: "Nas",              tier: "SUPERSTAR",   label: defJam,      bio: "Queensbridge rapper. Illmatic is widely considered the greatest rap album ever made. Unmatched pen game and storytelling.", era: "1994–present" },
    { name: "Jay-Z",            tier: "SUPERSTAR",   label: defJam,      bio: "Brooklyn MC turned mogul. One of the greatest commercial and critical rap careers in history.", era: "1996–present" },
    { name: "The Notorious B.I.G.", tier: "SUPERSTAR", label: defJam,    bio: "Brooklyn legend. The greatest natural rapper of all time — effortless flow, cinematic storytelling.", era: "1994–1997" },
    { name: "Lauryn Hill",      tier: "SUPERSTAR",   label: columbia,    bio: "The Miseducation of Lauryn Hill changed music. Rapper, singer, producer — rarely matched on any front.", era: "1998–present" },
    { name: "OutKast",          tier: "SUPERSTAR",   label: defJam,      bio: "Atlanta duo of André 3000 and Big Boi. The most creatively restless act in hip-hop history.", era: "1994–2006" },
    { name: "Wu-Tang Clan",     tier: "SUPERSTAR",   label: defJam,      bio: "Staten Island collective. Enter the Wu-Tang rewrote the rules for hip-hop collectivism and mythology.", era: "1993–present" },
    // R&B / Neo-Soul
    { name: "Frank Ocean",      tier: "MAINSTREAM",  label: defJam,      bio: "LA singer-songwriter. Channel Orange and Blonde are generation-defining works of fragmented R&B.", era: "2012–present" },
    { name: "SZA",              tier: "MAINSTREAM",  label: defJam,      bio: "St. Louis–born singer. Ctrl established her as the voice of a generation. SOS proved she could go mainstream without compromising.", era: "2017–present" },
    { name: "The Weeknd",       tier: "SUPERSTAR",   label: xo,          bio: "Toronto singer-songwriter. Redefined the sound of R&B with the Trilogy and cemented pop crossover dominance.", era: "2012–present" },
    { name: "D'Angelo",         tier: "INDEPENDENT", label: defJam,      bio: "Richmond, VA singer and multi-instrumentalist. Voodoo is the apex of neo-soul. Black Messiah proved the genius hadn't faded.", era: "1995–present" },
    { name: "Erykah Badu",      tier: "MAINSTREAM",  label: universal,   bio: "Dallas-born neo-soul pioneer. Queen of the genre — Baduizm set the blueprint.", era: "1997–present" },
    { name: "Anderson .Paak",   tier: "MAINSTREAM",  label: brainfeeder, bio: "Oxnard, CA multi-instrumentalist. Drummer, rapper, singer — one of the most gifted live performers of his generation.", era: "2014–present" },
    // Pop
    { name: "Rihanna",          tier: "SUPERSTAR",   label: defJam,      bio: "Barbadian pop and R&B icon. One of the best-selling music artists of all time. Anti is criminally underrated.", era: "2005–present" },
    { name: "Amy Winehouse",    tier: "MAINSTREAM",  label: island,      bio: "London singer-songwriter. Back to Black is a modern classic. Brutally honest, technically flawless.", era: "2003–2011" },
    { name: "Adele",            tier: "SUPERSTAR",   label: xl,          bio: "London-born singer. 21 and 25 are among the best-selling albums in history. Raw emotional devastation.", era: "2008–present" },
    { name: "Taylor Swift",     tier: "SUPERSTAR",   label: universal,   bio: "Folklore and Evermore represent her creative peak — intimate songwriting, indie-folk production.", era: "2006–present" },
    // Alternative
    { name: "Radiohead",        tier: "SUPERSTAR",   label: xl,          bio: "Oxford band. OK Computer and Kid A are two of the greatest albums ever made, in any genre.", era: "1993–present" },
    { name: "Bon Iver",         tier: "MAINSTREAM",  label: anti,        bio: "Justin Vernon's project. For Emma, Forever Ago and Bon Iver, Bon Iver defined a generation of indie folk.", era: "2007–present" },
    { name: "Arcade Fire",      tier: "MAINSTREAM",  label: columbia,    bio: "Montreal collective. Funeral is one of the great indie rock albums. Win Butler's anthemic ambition.", era: "2004–present" },
    { name: "Björk",            tier: "MAINSTREAM",  label: island,      bio: "Icelandic artist. One of the most consistently innovative acts in the history of recorded music.", era: "1993–present" },
    // UK Rap
    { name: "Little Simz",      tier: "RISING",      label: ago,         bio: "North London MC. Sometimes I Might Be Introvert is an artistic statement few peers can match.", era: "2015–present" },
    { name: "Dave",             tier: "RISING",      label: columbia,    bio: "Streatham rapper and producer. Psychodrama won the Mercury Prize. Exceptional craft and emotional depth.", era: "2017–present" },
    // Jazz-Adjacent
    { name: "Thundercat",       tier: "INDEPENDENT", label: brainfeeder, bio: "LA bassist and singer. Reinvented what bass-led music can sound like — jazz, funk, soul, and absurdist wit.", era: "2011–present" },
    { name: "Solange",          tier: "INDEPENDENT", label: columbia,    bio: "Houston-born singer and multi-hyphenate. A Seat at the Table is a masterwork of controlled vulnerability.", era: "2008–present" },
  ];

  const artistMap: Record<string, { id: string }> = {};
  for (const a of artistData) {
    const artist = await prisma.artist.upsert({
      where:  { slug: slug(a.name) },
      update: {},
      create: {
        name: a.name, slug: slug(a.name), era: a.era,
        artistTier: a.tier as any,
        labelId: a.label?.id ?? null,
        bio: a.bio,
      },
    });
    artistMap[a.name] = artist;
  }
  console.log(`  ✓ ${artistData.length} artists`);

  // ─── Albums + Songs ────────────────────────────────────────────────────────
  const albumSongs: Array<{
    artist: string; album: string; year: number;
    songs: Array<{ title: string; year: number }>;
  }> = [
    // Nas
    { artist: "Nas", album: "Illmatic", year: 1994, songs: [
      { title: "N.Y. State of Mind", year: 1994 },
      { title: "The World Is Yours", year: 1994 },
      { title: "One Love", year: 1994 },
      { title: "Memory Lane (Sittin' in da Park)", year: 1994 },
      { title: "Life's a Bitch", year: 1994 },
      { title: "Represent", year: 1994 },
    ]},
    { artist: "Nas", album: "It Was Written", year: 1996, songs: [
      { title: "If I Ruled the World (Imagine That)", year: 1996 },
      { title: "Street Dreams", year: 1996 },
    ]},
    // Jay-Z
    { artist: "Jay-Z", album: "Reasonable Doubt", year: 1996, songs: [
      { title: "Can't Knock the Hustle", year: 1996 },
      { title: "Dead Presidents II", year: 1996 },
      { title: "Feelin' It", year: 1996 },
    ]},
    { artist: "Jay-Z", album: "The Blueprint", year: 2001, songs: [
      { title: "The Takeover", year: 2001 },
      { title: "Izzo (H.O.V.A.)", year: 2001 },
      { title: "Heart of the City (Ain't No Love)", year: 2001 },
      { title: "Never Change", year: 2001 },
    ]},
    // Biggie
    { artist: "The Notorious B.I.G.", album: "Ready to Die", year: 1994, songs: [
      { title: "Juicy", year: 1994 },
      { title: "Big Poppa", year: 1994 },
      { title: "Warning", year: 1994 },
      { title: "Everyday Struggle", year: 1994 },
    ]},
    { artist: "The Notorious B.I.G.", album: "Life After Death", year: 1997, songs: [
      { title: "Hypnotize", year: 1997 },
      { title: "Mo Money Mo Problems", year: 1997 },
      { title: "Sky's the Limit", year: 1997 },
    ]},
    // Lauryn Hill
    { artist: "Lauryn Hill", album: "The Miseducation of Lauryn Hill", year: 1998, songs: [
      { title: "Doo Wop (That Thing)", year: 1998 },
      { title: "Ex-Factor", year: 1998 },
      { title: "Everything Is Everything", year: 1998 },
      { title: "To Zion", year: 1998 },
      { title: "Lost Ones", year: 1998 },
    ]},
    // OutKast
    { artist: "OutKast", album: "ATLiens", year: 1996, songs: [
      { title: "ATLiens", year: 1996 },
      { title: "Elevators (Me & You)", year: 1996 },
    ]},
    { artist: "OutKast", album: "Aquemini", year: 1998, songs: [
      { title: "Rosa Parks", year: 1998 },
      { title: "Aquemini", year: 1998 },
      { title: "Da Art of Storytellin' (Pt. 1)", year: 1998 },
    ]},
    { artist: "OutKast", album: "Stankonia", year: 2000, songs: [
      { title: "Ms. Jackson", year: 2000 },
      { title: "B.O.B.", year: 2000 },
      { title: "So Fresh, So Clean", year: 2000 },
    ]},
    // Wu-Tang
    { artist: "Wu-Tang Clan", album: "Enter the Wu-Tang (36 Chambers)", year: 1993, songs: [
      { title: "C.R.E.A.M.", year: 1993 },
      { title: "Protect Ya Neck", year: 1993 },
      { title: "Wu-Tang Clan Ain't Nuthing ta F' Wit", year: 1993 },
      { title: "Method Man", year: 1993 },
    ]},
    // Frank Ocean
    { artist: "Frank Ocean", album: "Channel Orange", year: 2012, songs: [
      { title: "Thinkin Bout You", year: 2012 },
      { title: "Super Rich Kids", year: 2012 },
      { title: "Pyramids", year: 2012 },
      { title: "Bad Religion", year: 2012 },
      { title: "Sweet Life", year: 2012 },
    ]},
    { artist: "Frank Ocean", album: "Blonde", year: 2016, songs: [
      { title: "Nikes", year: 2016 },
      { title: "Self Control", year: 2016 },
      { title: "Nights", year: 2016 },
      { title: "Pink + White", year: 2016 },
    ]},
    // SZA
    { artist: "SZA", album: "Ctrl", year: 2017, songs: [
      { title: "The Weekend", year: 2017 },
      { title: "Drew Barrymore", year: 2017 },
      { title: "Normal Girl", year: 2017 },
      { title: "Love Galore", year: 2017 },
    ]},
    { artist: "SZA", album: "SOS", year: 2022, songs: [
      { title: "Kill Bill", year: 2022 },
      { title: "Shirt", year: 2022 },
      { title: "Snooze", year: 2022 },
    ]},
    // The Weeknd
    { artist: "The Weeknd", album: "Beauty Behind the Madness", year: 2015, songs: [
      { title: "The Hills", year: 2015 },
      { title: "Can't Feel My Face", year: 2015 },
      { title: "Often", year: 2015 },
    ]},
    { artist: "The Weeknd", album: "After Hours", year: 2020, songs: [
      { title: "Blinding Lights", year: 2020 },
      { title: "Save Your Tears", year: 2020 },
      { title: "Heartless", year: 2019 },
    ]},
    // D'Angelo
    { artist: "D'Angelo", album: "Voodoo", year: 2000, songs: [
      { title: "Untitled (How Does It Feel)", year: 2000 },
      { title: "Devil's Pie", year: 2000 },
      { title: "Left & Right", year: 2000 },
    ]},
    { artist: "D'Angelo", album: "Black Messiah", year: 2014, songs: [
      { title: "Sugah Daddy", year: 2014 },
      { title: "Really Love", year: 2014 },
    ]},
    // Erykah Badu
    { artist: "Erykah Badu", album: "Baduizm", year: 1997, songs: [
      { title: "On & On", year: 1997 },
      { title: "Next Lifetime", year: 1997 },
      { title: "Certainly", year: 1997 },
    ]},
    { artist: "Erykah Badu", album: "Mama's Gun", year: 2000, songs: [
      { title: "Bag Lady", year: 2000 },
      { title: "Didn't Cha Know", year: 2000 },
    ]},
    // Anderson .Paak
    { artist: "Anderson .Paak", album: "Malibu", year: 2016, songs: [
      { title: "Come Down", year: 2016 },
      { title: "Am I Wrong", year: 2016 },
      { title: "The Bird", year: 2016 },
    ]},
    { artist: "Anderson .Paak", album: "Oxnard", year: 2018, songs: [
      { title: "Tints", year: 2018 },
      { title: "Who R U?", year: 2018 },
    ]},
    // Rihanna
    { artist: "Rihanna", album: "Anti", year: 2016, songs: [
      { title: "Needed Me", year: 2016 },
      { title: "Kiss It Better", year: 2016 },
      { title: "Work", year: 2016 },
      { title: "Love on the Brain", year: 2016 },
    ]},
    { artist: "Rihanna", album: "Good Girl Gone Bad", year: 2007, songs: [
      { title: "Umbrella", year: 2007 },
      { title: "Don't Stop the Music", year: 2007 },
    ]},
    // Amy Winehouse
    { artist: "Amy Winehouse", album: "Back to Black", year: 2006, songs: [
      { title: "Rehab", year: 2006 },
      { title: "Back to Black", year: 2006 },
      { title: "Valerie", year: 2007 },
      { title: "You Know I'm No Good", year: 2006 },
      { title: "Tears Dry on Their Own", year: 2007 },
    ]},
    // Adele
    { artist: "Adele", album: "21", year: 2011, songs: [
      { title: "Rolling in the Deep", year: 2011 },
      { title: "Someone Like You", year: 2011 },
      { title: "Set Fire to the Rain", year: 2011 },
    ]},
    { artist: "Adele", album: "25", year: 2015, songs: [
      { title: "Hello", year: 2015 },
      { title: "When We Were Young", year: 2015 },
    ]},
    // Taylor Swift (indie/folk era only)
    { artist: "Taylor Swift", album: "folklore", year: 2020, songs: [
      { title: "cardigan", year: 2020 },
      { title: "exile", year: 2020 },
      { title: "august", year: 2020 },
      { title: "seven", year: 2020 },
    ]},
    { artist: "Taylor Swift", album: "evermore", year: 2020, songs: [
      { title: "champagne problems", year: 2020 },
      { title: "tolerate it", year: 2020 },
      { title: "no body no crime", year: 2020 },
    ]},
    // Radiohead
    { artist: "Radiohead", album: "OK Computer", year: 1997, songs: [
      { title: "Karma Police", year: 1997 },
      { title: "Paranoid Android", year: 1997 },
      { title: "No Surprises", year: 1997 },
      { title: "Exit Music (For a Film)", year: 1997 },
    ]},
    { artist: "Radiohead", album: "Kid A", year: 2000, songs: [
      { title: "Everything in Its Right Place", year: 2000 },
      { title: "How to Disappear Completely", year: 2000 },
      { title: "National Anthem", year: 2000 },
    ]},
    // Bon Iver
    { artist: "Bon Iver", album: "For Emma, Forever Ago", year: 2008, songs: [
      { title: "Skinny Love", year: 2008 },
      { title: "Flume", year: 2008 },
      { title: "Re: Stacks", year: 2008 },
    ]},
    { artist: "Bon Iver", album: "Bon Iver, Bon Iver", year: 2011, songs: [
      { title: "Holocene", year: 2011 },
      { title: "Perth", year: 2011 },
      { title: "Beth/Rest", year: 2011 },
    ]},
    // Arcade Fire
    { artist: "Arcade Fire", album: "Funeral", year: 2004, songs: [
      { title: "Wake Up", year: 2004 },
      { title: "Rebellion (Lies)", year: 2004 },
      { title: "Neighborhood #1 (Tunnels)", year: 2004 },
    ]},
    // Björk
    { artist: "Björk", album: "Post", year: 1995, songs: [
      { title: "Army of Me", year: 1995 },
      { title: "Hyperballad", year: 1995 },
    ]},
    { artist: "Björk", album: "Homogenic", year: 1997, songs: [
      { title: "Jóga", year: 1997 },
      { title: "Bachelorette", year: 1997 },
      { title: "All Is Full of Love", year: 1997 },
    ]},
    // Little Simz
    { artist: "Little Simz", album: "Sometimes I Might Be Introvert", year: 2021, songs: [
      { title: "Introvert", year: 2021 },
      { title: "Woman", year: 2021 },
      { title: "Rollin Stone", year: 2021 },
      { title: "I Love You, I Hate You", year: 2021 },
    ]},
    // Dave
    { artist: "Dave", album: "Psychodrama", year: 2019, songs: [
      { title: "Black", year: 2019 },
      { title: "Location", year: 2019 },
      { title: "Lesley", year: 2019 },
    ]},
    // Thundercat
    { artist: "Thundercat", album: "Drunk", year: 2017, songs: [
      { title: "Them Changes", year: 2017 },
      { title: "Friend Zone", year: 2017 },
      { title: "Show You the Way", year: 2017 },
    ]},
    // Solange
    { artist: "Solange", album: "A Seat at the Table", year: 2016, songs: [
      { title: "Cranes in the Sky", year: 2016 },
      { title: "Don't Touch My Hair", year: 2016 },
      { title: "Mad", year: 2016 },
    ]},
  ];

  let albumCount = 0;
  let songCount = 0;

  for (const { artist, album, year, songs } of albumSongs) {
    const artistRecord = artistMap[artist];
    if (!artistRecord) { console.warn(`  ⚠ Artist not found: ${artist}`); continue; }

    const albumRecord = await prisma.album.upsert({
      where:  { slug: slug(album) },
      update: {},
      create: { title: album, slug: slug(album), year, artistId: artistRecord.id },
    });
    albumCount++;

    for (const song of songs) {
      await prisma.song.upsert({
        where:  { slug: slug(`${artist}-${song.title}`) },
        update: {},
        create: {
          title:             song.title,
          slug:              slug(`${artist}-${song.title}`),
          year:              song.year,
          albumId:           albumRecord.id,
          primaryArtistId:   artistRecord.id,
          production_score:  0,
          engineering_score: 0,
          creativity_score:  0,
          performance_score: 0,
          longevity_score:   0,
          sample_score:      0,
          critical_score:    0,
          cultural_moment_score: 0,
          peer_score:        0,
        },
      });
      songCount++;
    }
  }

  console.log(`  ✓ ${albumCount} albums, ${songCount} songs (awaiting AI scoring)`);
}
