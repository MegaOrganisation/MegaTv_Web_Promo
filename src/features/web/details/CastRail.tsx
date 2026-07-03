"use client";

import { User } from "lucide-react";
import { useState } from "react";

import { ActorModal } from "@/features/web/details/ActorModal";

export type CastMember = {
  id: number;
  name: string;
  character: string | null;
  profileUrl: string | null;
};

type Props = {
  cast: CastMember[];
  profileId: string;
};

export function CastRail({ cast, profileId }: Props) {
  const [selected, setSelected] = useState<CastMember | null>(null);

  return (
    <section className="space-y-3 px-1">
      <h2 className="text-lg font-bold text-[var(--mega-text)]">Casting</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {cast.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => setSelected(member)}
            className="focus-ring group w-[92px] shrink-0 text-center"
            title={`Voir ${member.name}`}
          >
            <div className="relative mx-auto h-[92px] w-[92px] overflow-hidden rounded-full border border-[var(--mega-border)] bg-[var(--mega-surface)] transition group-hover:border-[var(--mega-border-strong)] group-hover:scale-[1.05]">
              {member.profileUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.profileUrl} alt={member.name} className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center text-[var(--mega-text-faint)]">
                  <User className="h-7 w-7" />
                </span>
              )}
            </div>
            <p className="mt-2 line-clamp-1 text-xs font-semibold text-[var(--mega-text)] group-hover:underline">
              {member.name}
            </p>
            {member.character ? (
              <p className="line-clamp-1 text-[10px] text-[var(--mega-text-faint)]">{member.character}</p>
            ) : null}
          </button>
        ))}
      </div>

      <ActorModal
        personId={selected?.id ?? null}
        fallbackName={selected?.name ?? ""}
        profileId={profileId}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
