"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { MegaButton } from "@/components/ui/MegaButton";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <MegaButton type="button" variant="ghost" onClick={signOut}>
      <LogOut className="h-4 w-4" />
      Se déconnecter
    </MegaButton>
  );
}
