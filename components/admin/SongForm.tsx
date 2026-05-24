"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CreditRole } from "@prisma/client";
import { saveSong } from "@/app/admin/songs/actions";

interface Artist { id: string; name: string }
interface Album { id: string; title: string; year: number; artist: { name: string } }
interface Credit { id: string; name: string; role: CreditRole }

interface Props {
  artists: Artist[];
  albums: Album[];
  credits: Credit[];
  initialData?: Partial<SongFormData> & { id?: string };
}

interface SongFormData {
  title: string; slug: string; year: number;
  primaryArtistId: string; albumId: string;
  lyricism_score: string; production_score: string; engineering_score: string;
  creativity_score: string; performance_score: string;
  longevity_score: string; sample_score: string; critical_score: string;
  cultural_moment_score: string; peer_score: string;
  lifetime_streams: string; peak_chart_position: string; chart_name: string;
  certification_level: string; physical_sales: string; digital_sales: string;
  tiktok_video_count: string; platform_trend_peaks: string; ugc_volume: string;
  stream_spike_post_viral: boolean; search_volume_surge: boolean;
  sync_placement_count: string; virality_durability: string;
  creditIds: string[];
  isInstrumental: boolean;
}

const defaultForm: SongFormData = {
  title: "", slug: "", year: new Date().getFullYear(),
  primaryArtistId: "", albumId: "",
  lyricism_score: "75", production_score: "75", engineering_score: "75",
  creativity_score: "75", performance_score: "75",
  longevity_score: "50", sample_score: "30", critical_score: "70",
  cultural_moment_score: "50", peer_score: "50",
  lifetime_streams: "0", peak_chart_position: "", chart_name: "",
  certification_level: "NONE", physical_sales: "", digital_sales: "",
  tiktok_video_count: "", platform_trend_peaks: "", ugc_volume: "",
  stream_spike_post_viral: false, search_volume_surge: false,
  sync_placement_count: "0", virality_durability: "LASTING",
  creditIds: [], isInstrumental: false,
};

function scoreInput(
  label: string, weight: string,
  value: string, onChange: (v: string) => void,
) {
  return (
    <div key={label}>
      <label className="flex justify-between text-xs font-body text-text-muted mb-1">
        <span>{label}</span>
        <span className="opacity-50">{weight}</span>
      </label>
      <div className="flex items-center gap-2">
        <input
          type="range" min="0" max="100" step="1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 accent-tier-great h-1.5"
        />
        <span className="font-mono text-xs text-text-primary w-7 text-right">{value}</span>
      </div>
    </div>
  );
}

export function SongForm({ artists, albums, credits, initialData }: Props) {
  const [form, setForm] = useState<SongFormData>(() => {
    if (!initialData) return defaultForm;
    return {
      ...defaultForm,
      ...Object.fromEntries(
        Object.entries(initialData).map(([k, v]) => [k, v == null ? "" : String(v)])
      ),
      stream_spike_post_viral: Boolean(initialData.stream_spike_post_viral),
      search_volume_surge: Boolean(initialData.search_volume_surge),
      isInstrumental: initialData.lyricism_score == null,
      creditIds: initialData.creditIds ?? [],
    };
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const set = (key: keyof SongFormData, value: string | boolean | string[]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/['']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const toggleCredit = (id: string) =>
    set("creditIds", form.creditIds.includes(id)
      ? form.creditIds.filter((c) => c !== id)
      : [...form.creditIds, id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await saveSong({ ...form, songId: initialData?.id });
      if (res?.error) { setError(res.error); return; }
      router.push("/admin");
    });
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
      <h3 className="font-display text-lg tracking-wider text-text-primary">{title}</h3>
      {children}
    </div>
  );

  const Input = ({ label, field, type = "text", placeholder = "" }: {
    label: string; field: keyof SongFormData; type?: string; placeholder?: string;
  }) => (
    <div>
      <label className="text-xs text-text-muted font-body block mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[field] as string}
        onChange={(e) => set(field, e.target.value)}
        className="w-full bg-raised border border-border rounded px-3 py-2 text-sm font-body text-text-primary focus:outline-none focus:border-tier-great"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Section title="Track Info">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Input label="Title" field="title" />
          </div>
          <div>
            <label className="text-xs text-text-muted font-body block mb-1">Slug</label>
            <input
              value={form.slug || autoSlug(form.title)}
              onChange={(e) => set("slug", e.target.value)}
              className="w-full bg-raised border border-border rounded px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-tier-great"
            />
          </div>
          <Input label="Year" field="year" type="number" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted font-body block mb-1">Artist</label>
            <select
              value={form.primaryArtistId}
              onChange={(e) => set("primaryArtistId", e.target.value)}
              className="w-full bg-raised border border-border rounded px-3 py-2 text-sm font-body text-text-primary focus:outline-none focus:border-tier-great"
              required
            >
              <option value="">— Select artist —</option>
              {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted font-body block mb-1">Album (optional)</label>
            <select
              value={form.albumId}
              onChange={(e) => set("albumId", e.target.value)}
              className="w-full bg-raised border border-border rounded px-3 py-2 text-sm font-body text-text-primary focus:outline-none focus:border-tier-great"
            >
              <option value="">— Single / standalone —</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>{a.title} ({a.year}) — {a.artist.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section title="Quality Scores">
        <label className="flex items-center gap-2 text-sm font-body text-text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={form.isInstrumental}
            onChange={(e) => set("isInstrumental", e.target.checked)}
            className="accent-tier-great"
          />
          Instrumental (redistributes lyricism weight to production + engineering)
        </label>
        {!form.isInstrumental && scoreInput("Lyricism", "25%", form.lyricism_score, (v) => set("lyricism_score", v))}
        {scoreInput("Production", "25%", form.production_score, (v) => set("production_score", v))}
        {scoreInput("Engineering & Mix", "20%", form.engineering_score, (v) => set("engineering_score", v))}
        {scoreInput("Creativity & Originality", "20%", form.creativity_score, (v) => set("creativity_score", v))}
        {scoreInput("Performance", "10%", form.performance_score, (v) => set("performance_score", v))}
      </Section>

      <Section title="Cultural Impact Scores">
        {scoreInput("Longevity", "30%", form.longevity_score, (v) => set("longevity_score", v))}
        {scoreInput("Sample / Interpolation", "20%", form.sample_score, (v) => set("sample_score", v))}
        {scoreInput("Critical Consensus", "20%", form.critical_score, (v) => set("critical_score", v))}
        {scoreInput("Cultural Moment", "20%", form.cultural_moment_score, (v) => set("cultural_moment_score", v))}
        {scoreInput("Peer Recognition", "10%", form.peer_score, (v) => set("peer_score", v))}
      </Section>

      <Section title="Commercial Data">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Lifetime Streams" field="lifetime_streams" type="number" placeholder="0" />
          <div>
            <label className="text-xs text-text-muted font-body block mb-1">Certification</label>
            <select
              value={form.certification_level}
              onChange={(e) => set("certification_level", e.target.value)}
              className="w-full bg-raised border border-border rounded px-3 py-2 text-sm font-body text-text-primary focus:outline-none focus:border-tier-great"
            >
              {["NONE","GOLD","PLAT","TWO_PLAT","THREE_PLAT","FOUR_PLAT","FIVE_PLAT","DIAMOND"].map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <Input label="Peak Chart Position" field="peak_chart_position" type="number" placeholder="e.g. 1" />
          <div>
            <label className="text-xs text-text-muted font-body block mb-1">Chart</label>
            <select
              value={form.chart_name}
              onChange={(e) => set("chart_name", e.target.value)}
              className="w-full bg-raised border border-border rounded px-3 py-2 text-sm font-body text-text-primary focus:outline-none focus:border-tier-great"
            >
              <option value="">— None —</option>
              {["HOT_100","R_B_HIP_HOP","RAP","REGIONAL"].map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <Input label="TikTok Videos" field="tiktok_video_count" type="number" placeholder="0" />
          <Input label="Sync Placements" field="sync_placement_count" type="number" placeholder="0" />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
            <input type="checkbox" checked={form.stream_spike_post_viral} onChange={(e) => set("stream_spike_post_viral", e.target.checked)} className="accent-tier-great" />
            Stream spike post-viral
          </label>
          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
            <input type="checkbox" checked={form.search_volume_surge} onChange={(e) => set("search_volume_surge", e.target.checked)} className="accent-tier-great" />
            Search volume surge
          </label>
        </div>
        <div>
          <label className="text-xs text-text-muted font-body block mb-1">Virality Durability</label>
          <select
            value={form.virality_durability}
            onChange={(e) => set("virality_durability", e.target.value)}
            className="bg-raised border border-border rounded px-3 py-2 text-sm font-body text-text-primary focus:outline-none focus:border-tier-great"
          >
            <option value="LASTING">LASTING (×1.0)</option>
            <option value="FADED">FADED (×0.65)</option>
            <option value="SLOW_BURN">SLOW BURN (×1.1)</option>
          </select>
        </div>
      </Section>

      <Section title="Credits">
        <p className="text-xs text-text-muted">Select producers and engineers credited on this track.</p>
        <div className="grid grid-cols-2 gap-2">
          {credits.map((c) => (
            <label
              key={c.id}
              className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors text-sm font-body ${
                form.creditIds.includes(c.id)
                  ? "border-tier-great/60 bg-tier-great/10 text-text-primary"
                  : "border-border text-text-muted hover:border-border/80"
              }`}
            >
              <input
                type="checkbox"
                checked={form.creditIds.includes(c.id)}
                onChange={() => toggleCredit(c.id)}
                className="accent-tier-great"
              />
              <div>
                <span>{c.name}</span>
                <span className="text-xs opacity-50 ml-1">{c.role}</span>
              </div>
            </label>
          ))}
        </div>
      </Section>

      {error && <p className="text-sm text-tier-skip font-body">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="bg-tier-great text-bg font-display tracking-wider px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? "SAVING..." : initialData?.id ? "UPDATE SONG" : "ADD SONG"}
      </button>
    </form>
  );
}
