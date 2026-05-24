import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <p className="font-mono text-6xl text-text-muted mb-4">.000</p>
        <p className="font-display text-3xl tracking-wider text-text-primary mb-2">NOT FOUND</p>
        <p className="font-body text-text-muted mb-8">That page doesn&apos;t have a stat line.</p>
        <Link href="/" className="font-body text-tier-great hover:underline text-sm">
          ← Back to leaderboard
        </Link>
      </div>
    </div>
  );
}
