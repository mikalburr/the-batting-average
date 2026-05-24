import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-widest text-text-primary hover:text-tier-great transition-colors">
          THE BATTING AVERAGE
        </Link>
        <nav className="flex items-center gap-6 text-xs font-body text-text-muted">
          <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
        </nav>
      </div>
    </header>
  );
}
