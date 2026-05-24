import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

// Auth redirect handled by middleware.ts — this layout just provides the admin shell.
// Render children directly on the login page (no session yet).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) return <>{children}</>;

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/admin" className="font-display text-lg tracking-wider text-text-primary">
            ADMIN
          </Link>
          <div className="flex items-center gap-4 text-xs text-text-muted font-body">
            <Link href="/admin/songs/new" className="hover:text-tier-great transition-colors">+ Song</Link>
            <Link href="/admin/artists/new" className="hover:text-tier-great transition-colors">+ Artist</Link>
            <Link href="/admin/albums/new" className="hover:text-tier-great transition-colors">+ Album</Link>
            <Link href="/admin/credits/new" className="hover:text-tier-great transition-colors">+ Credit</Link>
            <Link href="/" className="hover:text-text-primary transition-colors">← Site</Link>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
