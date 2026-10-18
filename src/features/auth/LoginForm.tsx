"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = sanitizeNext(searchParams.get("next") || searchParams.get("redirect") || searchParams.get("returnUrl"));
  const initialMode = useMemo<AuthMode>(() => (searchParams.get("mode") === "signup" ? "signup" : "login"), [searchParams]);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const cleanEmail = email.trim();

      if (mode === "signup") {
        if (password.length < 6) {
          setMessage({ text: "Le mot de passe doit contenir au moins 6 caractères.", type: "error" });
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setMessage({ text: "Les mots de passe ne correspondent pas.", type: "error" });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
          }
        });
        if (error) {
          setMessage({ text: error.message, type: "error" });
          return;
        }
        if (data.session) {
          router.replace(next);
          router.refresh();
          return;
        }
        setMessage({
          text: "Compte MegaTvCloud créé. Vérifiez votre boîte e-mail pour valider votre compte, puis connectez-vous.",
          type: "success"
        });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) {
        setMessage({ text: error.message, type: "error" });
        return;
      }
      if (next === "/" || next.startsWith("/#")) {
        window.location.href = next;
      } else {
        router.replace(next);
        router.refresh();
      }
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Connexion impossible pour le moment.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    try {
      setLoading(true);
      setMessage(null);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
        }
      });
      if (error) {
        setMessage({ text: error.message, type: "error" });
        setLoading(false);
      }
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Connexion avec Google impossible pour le moment.",
        type: "error"
      });
      setLoading(false);
    }
  }

  async function sendPasswordReset() {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setMessage({
        text: "Saisissez d'abord votre adresse e-mail pour recevoir le lien de réinitialisation.",
        type: "error"
      });
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
        setMessage({ text: error.message, type: "error" });
        return;
      }
      setMessage({
        text: "E-mail de réinitialisation envoyé. Vérifiez votre boîte de réception.",
        type: "success"
      });
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Réinitialisation impossible pour le moment.",
        type: "error"
      });
    } finally {
      setResetLoading(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage(null);
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="w-full text-slate-900">
      {/* Header matching TV & Mobile App (PJ 2) */}
      <div className="mb-5 sm:mb-6">
        <p className="text-[15px] sm:text-base font-bold text-slate-800 tracking-tight">MegaTvCloud</p>
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mt-0.5">
          {mode === "signup" ? "Créer un compte" : "S'identifier"}
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1 leading-relaxed">
          {mode === "signup"
            ? "Créez votre compte MegaTvCloud pour synchroniser vos appareils."
            : "Connectez-vous à votre compte MegaTvCloud."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        {/* Email input pill */}
        <div className="relative rounded-[16px] bg-[#ebf0f5] border border-transparent transition focus-within:border-slate-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            autoComplete="email"
            placeholder="Adresse e-mail"
            className="w-full bg-transparent px-4 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Password input pill with toggle visibility eye */}
        <div className="relative flex items-center rounded-[16px] bg-[#ebf0f5] border border-transparent pr-2 transition focus-within:border-slate-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100">
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type={showPassword ? "text" : "password"}
            required
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder="Mot de passe (6 caractères min.)"
            className="w-full bg-transparent pl-4 pr-2 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-700"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Confirm password input pill (in signup mode) */}
        {mode === "signup" ? (
          <div className="relative flex items-center rounded-[16px] bg-[#ebf0f5] border border-transparent pr-2 transition focus-within:border-slate-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100">
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type={showConfirmPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Confirmer le mot de passe"
              className="w-full bg-transparent pl-4 pr-2 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-700"
              aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        ) : null}

        {/* Status / Alert Message */}
        {message ? (
          <div
            className={`rounded-2xl p-3.5 text-xs sm:text-sm font-medium border leading-relaxed ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        {/* Action Button matching PJ 2 */}
        <div className="pt-1.5 space-y-2.5">
          <button
            type="submit"
            disabled={loading || resetLoading}
            className={`w-full py-3.5 px-4 rounded-[16px] font-bold text-sm sm:text-base transition flex items-center justify-center gap-2 ${
              loading
                ? "bg-[#cbd5e1] text-white cursor-wait"
                : "bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-sm active:scale-[0.99]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{mode === "signup" ? "Création en cours..." : "Connexion en cours..."}</span>
              </>
            ) : (
              <span>{mode === "signup" ? "Créer un compte" : "S'identifier"}</span>
            )}
          </button>

          {/* Continue with Google button */}
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading || resetLoading}
            className="w-full py-3 px-4 rounded-[16px] border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition active:scale-[0.99] shadow-sm disabled:opacity-50"
          >
            <svg className="h-4 w-4 sm:h-4.5 sm:w-4.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuer avec Google</span>
          </button>
        </div>

        {/* Footer Mode Switch */}
        <div className="pt-3 text-center">
          {mode === "signup" ? (
            <p className="text-xs sm:text-[13px] text-slate-600 font-medium">
              Vous possédez déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-bold text-[#1d4ed8] hover:underline"
              >
                S'identifier
              </button>
            </p>
          ) : (
            <p className="text-xs sm:text-[13px] text-slate-600 font-medium">
              Vous n'avez pas de compte ?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="font-bold text-[#1d4ed8] hover:underline"
              >
                Créer un compte
              </button>
            </p>
          )}

          {mode === "login" ? (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={sendPasswordReset}
                disabled={loading || resetLoading}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition underline-offset-2 hover:underline"
              >
                {resetLoading ? "Envoi du lien..." : "Mot de passe oublié ?"}
              </button>
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function sanitizeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/companion";
  return value;
}
