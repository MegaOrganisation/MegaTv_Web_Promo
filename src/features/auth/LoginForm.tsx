"use client";

import { useState, type FormEvent } from "react";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { MegaButton } from "@/components/ui/MegaButton";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = sanitizeNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setMessage(error.message);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Connexion impossible pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-white/58">
        <ShieldCheck className="mb-2 h-5 w-5 text-white/72" />
        Connexion protégée par Supabase Auth. Après connexion, MegaCompagnon ne lit que les lignes autorisées par RLS.
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/68">Adresse email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          autoComplete="email"
          placeholder="vous@email.com"
          className="focus-ring w-full rounded-full border border-white/12 bg-black/30 px-5 py-3 text-white placeholder:text-white/30"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/68">Mot de passe</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="focus-ring w-full rounded-full border border-white/12 bg-black/30 px-5 py-3 text-white placeholder:text-white/30"
        />
      </label>
      {message ? <p className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">{message}</p> : null}
      <MegaButton type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Lancer le compagnon
      </MegaButton>
      <button type="button" onClick={signOut} className="focus-ring w-full rounded-full py-2 text-xs font-semibold text-white/38 hover:text-white/70">
        Réinitialiser la session locale
      </button>
    </form>
  );
}

function sanitizeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/companion";
  return value;
}
