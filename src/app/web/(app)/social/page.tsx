import { CompanionSocialHub } from "@/features/companion/social/CompanionSocialHub";
import { WebCompanionProfileBridge } from "@/features/web/WebCompanionProfileBridge";

export const dynamic = "force-dynamic";

export default function WebSocialPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="px-1">
        <h1 className="text-2xl font-bold text-[var(--mega-text)]">Social</h1>
        <p className="mt-1 text-sm text-[var(--mega-text-faint)]">
          Amis, Match et partages — synchronisés avec l&apos;app MegaTv (même graphe MegaCloud).
        </p>
      </div>
      <WebCompanionProfileBridge>
        <CompanionSocialHub />
      </WebCompanionProfileBridge>
    </div>
  );
}
