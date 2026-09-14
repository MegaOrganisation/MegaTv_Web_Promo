"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Copy, Search, Shield } from "lucide-react";

import { AdminProfileAvatar } from "@/features/admin/accounts/AdminProfileAvatar";
import type { AdminAccount } from "@/features/admin/accounts/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { MegaButton } from "@/components/ui/MegaButton";

type PlanFilter = "all" | "pro" | "free";
type PlanAction = "pro" | "lifetime" | "free";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function planLabel(account: AdminAccount) {
  if (account.is_pro && account.plan_tier === "lifetime") return "Lifetime";
  if (account.is_pro && account.plan_tier === "trial") return "Essai Pro";
  if (account.is_pro) return "Pro";
  return "Free";
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function AdminAccountsConsole() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [selfUserId, setSelfUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PlanFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const load = async () => {
    setError(null);
    const res = await fetch("/api/admin/accounts");
    const json = (await res.json()) as { accounts?: AdminAccount[]; selfUserId?: string; error?: string };
    if (!res.ok) {
      setError(json.error || "Impossible de charger les comptes.");
      setAccounts([]);
      return;
    }
    setAccounts(json.accounts || []);
    setSelfUserId(json.selfUserId || null);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((account) => {
      if (filter === "pro" && !account.is_pro) return false;
      if (filter === "free" && account.is_pro) return false;
      if (!q) return true;
      const hay = [
        account.email,
        account.user_id,
        account.plan_tier,
        ...(account.profiles || []).flatMap((profile) => [profile.name, profile.friend_code, profile.profile_id])
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [accounts, filter, query]);

  const setPlan = async (account: AdminAccount, planTier: PlanAction) => {
    const email = account.email || account.user_id;
    const prompts: Record<PlanAction, string> = {
      pro: `Activer Pro pour ${email} ?\n\nUtile pour un test, ou si le paiement est passé sans entitlement.`,
      lifetime: `Passer ${email} en Lifetime ?\n\nPlus durable qu’un Pro mensuel (les webhooks Stripe ne l’écrasent pas).`,
      free: `Retirer Pro pour ${email} ? Le compte redevient Free.`
    };
    if (!window.confirm(prompts[planTier])) return;

    setBusyId(account.user_id);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: account.user_id, planTier })
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error || "Échec de la mise à jour du plan.");
        return;
      }
      await load();
      setStatus(
        planTier === "free"
          ? `Pro retiré pour ${email}.`
          : `${planTier === "lifetime" ? "Lifetime" : "Pro"} activé pour ${email}. Relancer l’app MegaTv pour rafraîchir l’entitlement (cache 24 h sinon).`
      );
    } finally {
      setBusyId(null);
    }
  };

  const deleteAccount = async (account: AdminAccount) => {
    const expected = (account.email || account.user_id).toLowerCase();
    if (deleteConfirm.trim().toLowerCase() !== expected) {
      setError("Tapez l’e-mail exact (ou l’UUID) pour confirmer la suppression.");
      return;
    }
    setBusyId(account.user_id);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: account.user_id, confirmEmail: deleteConfirm.trim() })
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error || "Échec de la suppression.");
        return;
      }
      setDeleteId(null);
      setDeleteConfirm("");
      setOpenId(null);
      await load();
      setStatus(`Compte ${account.email || account.user_id} supprimé (Auth + données cloud).`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 text-white/70" />
          <div>
            <h2 className="text-xl font-bold text-white">Gestion utilisateurs</h2>
            <p className="mt-1 text-sm text-white/45">
              Photos de profil, codes ami, override Pro. La suppression détruit le compte MegaTv Cloud (cascade Auth).
              Jamais le PIN.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E-mail, code ami, nom de profil…"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "Tous"],
                ["pro", "Pro"],
                ["free", "Free"]
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  filter === id ? "border-white/30 bg-white/14 text-white" : "border-white/10 text-white/55"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs text-white/40">
          {loading ? "Chargement…" : `${filtered.length} compte${filtered.length > 1 ? "s" : ""}`}
          {!loading ? ` · ${accounts.filter((a) => a.is_pro).length} Pro` : ""}
        </p>
      </GlassCard>

      {error ? (
        <GlassCard className="border-red-300/20 bg-red-500/8">
          <p className="text-sm font-semibold text-red-100">{error}</p>
        </GlassCard>
      ) : null}
      {status ? (
        <GlassCard>
          <p className="text-sm text-white/70">{status}</p>
        </GlassCard>
      ) : null}

      <div className="space-y-3">
        {loading ? (
          <GlassCard>
            <p className="text-sm text-white/45">Lecture des comptes…</p>
          </GlassCard>
        ) : null}
        {!loading && filtered.length === 0 ? (
          <GlassCard>
            <p className="text-sm text-white/45">Aucun compte pour ce filtre.</p>
          </GlassCard>
        ) : null}
        {filtered.map((account) => {
          const open = openId === account.user_id;
          const busy = busyId === account.user_id;
          const isSelf = Boolean(selfUserId && account.user_id === selfUserId);
          const preview = (account.profiles || []).slice(0, 4);
          return (
            <GlassCard key={account.user_id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : account.user_id)}
                className="focus-ring flex w-full items-start gap-3 text-left"
                aria-expanded={open}
              >
                <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-white/45 transition ${open ? "rotate-180" : ""}`} />
                {preview.length ? (
                  <span className="mt-0.5 flex shrink-0 -space-x-2">
                    {preview.map((profile) => (
                      <span key={profile.profile_id} className="rounded-full ring-2 ring-black/40">
                        <AdminProfileAvatar profile={profile} size="sm" />
                      </span>
                    ))}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">{account.email || "Sans e-mail"}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        account.is_pro ? "bg-emerald-400/15 text-emerald-200" : "bg-white/8 text-white/55"
                      }`}
                    >
                      {planLabel(account)}
                    </span>
                    {account.source ? (
                      <span className="rounded-full bg-white/6 px-2 py-0.5 text-[11px] text-white/45">{account.source}</span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs text-white/40">
                    {account.profile_count} profil{account.profile_count > 1 ? "s" : ""} · créé {formatDate(account.created_at)} ·
                    dernière connexion {formatDate(account.last_sign_in_at)}
                  </span>
                </span>
              </button>

              {open ? (
                <div className="mt-4 space-y-4 border-t border-white/8 pt-4">
                  <div className="flex flex-wrap gap-2">
                    <MegaButton
                      disabled={busy || account.plan_tier === "pro" || account.plan_tier === "lifetime"}
                      onClick={() => setPlan(account, "pro")}
                    >
                      Activer Pro
                    </MegaButton>
                    <MegaButton
                      variant="ghost"
                      disabled={busy || (account.is_pro && account.plan_tier === "lifetime")}
                      onClick={() => setPlan(account, "lifetime")}
                    >
                      Lifetime
                    </MegaButton>
                    <MegaButton variant="danger" disabled={busy || !account.is_pro} onClick={() => setPlan(account, "free")}>
                      Retirer Pro
                    </MegaButton>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span className="font-mono">{account.user_id}</span>
                    <button
                      type="button"
                      className="focus-ring rounded-full border border-white/10 p-1 text-white/50 hover:text-white"
                      onClick={() => copyText(account.user_id)}
                      aria-label="Copier l’UUID compte"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {(account.profiles || []).length === 0 ? (
                    <p className="text-sm text-white/45">Aucun profil cloud pour ce compte.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[32rem] text-left text-sm">
                        <thead className="text-xs uppercase tracking-wide text-white/35">
                          <tr>
                            <th className="pb-2 font-semibold">Profil</th>
                            <th className="pb-2 font-semibold">Code ami</th>
                            <th className="pb-2 font-semibold">Type</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/8">
                          {account.profiles.map((profile) => (
                            <tr key={profile.profile_id}>
                              <td className="py-2.5 pr-3">
                                <div className="flex items-center gap-3">
                                  <AdminProfileAvatar profile={profile} size="md" />
                                  <div>
                                    <div className="font-semibold text-white">{profile.name || "Sans nom"}</div>
                                    <div className="font-mono text-[11px] text-white/35">{profile.profile_id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 pr-3">
                                {profile.friend_code ? (
                                  <button
                                    type="button"
                                    className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 font-mono text-xs font-bold tracking-widest text-white"
                                    onClick={() => copyText(profile.friend_code || "")}
                                  >
                                    {profile.friend_code}
                                    <Copy className="h-3 w-3 text-white/45" />
                                  </button>
                                ) : (
                                  <span className="text-white/35">—</span>
                                )}
                              </td>
                              <td className="py-2.5 text-white/55">{profile.is_kids ? "Kids" : "Standard"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="rounded-2xl border border-red-400/20 bg-red-500/8 p-4">
                    <p className="text-sm font-semibold text-red-100">Zone destructive</p>
                    {isSelf ? (
                      <p className="mt-2 text-xs text-red-100/70">Vous ne pouvez pas supprimer votre propre compte admin.</p>
                    ) : deleteId === account.user_id ? (
                      <div className="mt-3 space-y-3">
                        <p className="text-xs text-red-100/70">
                          Tapez <span className="font-mono text-red-50">{account.email || account.user_id}</span> pour
                          confirmer. Auth + profils + sync + codes ami seront détruits (cascade).
                        </p>
                        <input
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                          placeholder={account.email || account.user_id}
                          className="w-full rounded-xl border border-red-300/20 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                        />
                        <div className="flex flex-wrap gap-2">
                          <MegaButton variant="danger" disabled={busy} onClick={() => deleteAccount(account)}>
                            Supprimer définitivement
                          </MegaButton>
                          <MegaButton
                            variant="ghost"
                            disabled={busy}
                            onClick={() => {
                              setDeleteId(null);
                              setDeleteConfirm("");
                            }}
                          >
                            Annuler
                          </MegaButton>
                        </div>
                      </div>
                    ) : (
                      <MegaButton
                        className="mt-3"
                        variant="danger"
                        disabled={busy}
                        onClick={() => {
                          setDeleteId(account.user_id);
                          setDeleteConfirm("");
                        }}
                      >
                        Supprimer le compte
                      </MegaButton>
                    )}
                  </div>
                </div>
              ) : null}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
