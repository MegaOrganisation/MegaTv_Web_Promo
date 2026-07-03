"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useEffect, useState } from "react";

import { Modal } from "@/features/web/details/Modal";
import { Spinner } from "@/features/web/Spinner";
import { withProfileQuery } from "@/lib/companion/profile-scope";
import type { WebPerson } from "@/app/api/web/person/route";

type Props = {
  personId: number | null;
  fallbackName: string;
  profileId: string;
  onClose: () => void;
};

type State = { status: "loading" } | { status: "ready"; person: WebPerson } | { status: "error" };

// Client cache so re-opening the same actor never re-hits the route.
const cache = new Map<number, WebPerson>();

export function ActorModal({ personId, fallbackName, profileId, onClose }: Props) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (personId == null) return;
    let active = true;
    const load = async () => {
      const cached = cache.get(personId);
      if (cached) {
        if (active) setState({ status: "ready", person: cached });
        return;
      }
      if (active) setState({ status: "loading" });
      try {
        const res = await fetch(`/api/web/person?personId=${personId}`);
        if (!res.ok) throw new Error("http");
        const data = (await res.json()) as { person?: WebPerson };
        if (!active) return;
        if (!data.person) {
          setState({ status: "error" });
          return;
        }
        cache.set(personId, data.person);
        setState({ status: "ready", person: data.person });
      } catch {
        if (active) setState({ status: "error" });
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [personId]);

  const person = state.status === "ready" ? state.person : null;

  return (
    <Modal open={personId != null} onClose={onClose} label={person?.name || fallbackName} size="lg">
      <div className="p-5 pt-6 sm:p-6">
        {state.status === "loading" ? (
          <div className="grid place-items-center py-16">
            <Spinner size="lg" />
          </div>
        ) : null}

        {state.status === "error" ? (
          <p className="py-12 text-center text-sm text-[var(--mega-text-muted)]">
            Impossible de charger la fiche de {fallbackName}.
          </p>
        ) : null}

        {person ? (
          <>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-2xl border border-[var(--mega-border)] bg-[var(--mega-surface)]">
                {person.profileUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={person.profileUrl} alt={person.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-[var(--mega-text-faint)]">
                    <User className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 pr-6">
                <h2 className="text-2xl font-black text-[var(--mega-text)]">{person.name}</h2>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--mega-text-faint)]">
                  {person.birthday ? <span>Né(e) le {person.birthday}</span> : null}
                  {person.placeOfBirth ? <span>· {person.placeOfBirth}</span> : null}
                </div>
                {person.biography ? (
                  <p className="mt-3 max-h-40 overflow-y-auto text-sm leading-relaxed text-[var(--mega-text-muted)] [scrollbar-width:thin]">
                    {person.biography}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-[var(--mega-text-faint)]">Aucune biographie disponible.</p>
                )}
              </div>
            </div>

            {person.credits.length ? (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--mega-text-muted)]">
                  Filmographie
                </h3>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {person.credits.map((credit) => (
                    <button
                      key={credit.mediaId}
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push(withProfileQuery(`/web/details/${credit.mediaId}`, profileId));
                      }}
                      className="focus-ring group text-left"
                      title={credit.title}
                    >
                      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-[var(--mega-border)] bg-[var(--mega-surface)] transition duration-300 group-hover:scale-[1.05] group-hover:border-[var(--mega-border-strong)]">
                        {credit.posterUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={credit.posterUrl} alt={credit.title} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <p className="mt-1.5 line-clamp-1 text-[11px] font-medium text-[var(--mega-text-muted)] group-hover:text-[var(--mega-text)]">
                        {credit.title}
                      </p>
                      {credit.year ? <p className="text-[10px] text-[var(--mega-text-faint)]">{credit.year}</p> : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </Modal>
  );
}
