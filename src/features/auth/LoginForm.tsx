"use client";

import { useState, type FormEvent } from "react";
import { Loader2, LogIn, RotateCcw, ShieldCheck } from "lucide-react";
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
  const [resetLoading, setResetLoading] = useState(false);

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

  async function sendPasswordReset() {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setMessage("Saisissez votre adresse e-mail ID MegaTv avant de demander la réinitialisation.");
      return;
    }

    setResetLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/companion")}`
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage("E-mail de réinitialisation envoyé. Vérifiez votre boîte de réception MegaTv.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Réinitialisation impossible pour le moment.");
    } finally {
      setResetLoading(false);
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
        Connexion protégée par Supabase Auth. Après connexion, MegaCompagnon ne lit que les lignes autorisées par les règles RLS de votre ID MegaTv.
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/68">ID MegaTv / adresse e-mail</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          autoComplete="email"
          placeholder="votre-id@megatv.cloud"
          className="focus-ring w-full rounded-full border border-white/12 bg-black/30 px-5 py-3 text-white placeholder:text-white/30"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/68">Mot de passe MegaTv</span>
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
      {message ? <p className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-sm text-white/72">{message}</p> : null}
      <MegaButton type="submit" className="w-full" disabled={loading || resetLoading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Se connecter et lancer Companion
      </MegaButton>
      <button
        type="button"
        onClick={sendPasswordReset}
        disabled={loading || resetLoading}
        className="focus-ring flex w-full items-center justify-center gap-2 rounded-full py-2 text-xs font-semibold text-white/48 transition hover:text-white/78 disabled:pointer-events-none disabled:opacity-50"
      >
        {resetLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
        Mot de passe oublié
      </button>
      <button type="button" onClick={signOut} className="focus-ring w-full rounded-full py-2 text-xs font-semibold text-white/30 hover:text-white/60">
        Réinitialiser la session locale
      </button>
    </form>
  );
}

function sanitizeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/companion";
  return value;
}
