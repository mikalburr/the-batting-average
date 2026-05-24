import Link from "next/link";
import type { CreditRole, Tier } from "@prisma/client";
import { AvgDisplay } from "./ui/AvgDisplay";
import { TierBadge } from "./ui/TierBadge";
import { getTier } from "@/lib/scoring/tier";

interface Props {
  credit: {
    name: string;
    slug: string;
    role: CreditRole;
    avg: number | null;
    songCount?: number;
  };
}

const roleLabel: Record<CreditRole, string> = {
  PRODUCER: "Producer",
  ENGINEER: "Engineer",
  SONGWRITER: "Songwriter",
  FEATURE: "Feature",
  VOCALIST: "Vocalist",
};

const rolePath: Record<CreditRole, string> = {
  PRODUCER: "producer",
  ENGINEER: "engineer",
  SONGWRITER: "producer",
  FEATURE: "producer",
  VOCALIST: "producer",
};

export function CreditCard({ credit }: Props) {
  const tier: Tier | undefined =
    credit.avg != null ? getTier(credit.avg) : undefined;

  return (
    <Link
      href={`/${rolePath[credit.role]}/${credit.slug}`}
      className="flex items-center justify-between bg-raised p-3 rounded-lg border border-border hover:border-tier-great/50 transition-colors group"
    >
      <div>
        <p className="font-body text-sm text-text-primary group-hover:text-tier-great transition-colors">
          {credit.name}
        </p>
        <p className="text-xs text-text-muted mt-0.5">{roleLabel[credit.role]}</p>
      </div>
      <div className="text-right">
        <AvgDisplay value={credit.avg} tier={tier} size="sm" />
        {credit.songCount != null && (
          <p className="text-[10px] text-text-muted mt-0.5">{credit.songCount} {credit.songCount === 1 ? "song" : "songs"}</p>
        )}
      </div>
    </Link>
  );
}
