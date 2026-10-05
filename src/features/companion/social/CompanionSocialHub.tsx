"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users,
  Heart,
  Share2,
  Shield,
  Copy,
  Check,
  UserPlus,
  Flame,
  Search,
  Sparkles,
  Film,
  Tv,
  CheckCircle2,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Clock,
  ArrowRight
} from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

import { useCompanionProfile } from "@/features/companion/CompanionProfileProvider";
import { ProfileAvatar } from "@/features/dashboard/ProfileAvatar";
import { MegaButton } from "@/components/ui/MegaButton";
import type { SocialGraph, FriendWatchProposal, FriendMatchSession, MatchDeckCard, SocialFriend } from "@/lib/companion/social";

type TmdbSearchResult = {
  mediaId: string;
  mediaType: "movie" | "tv";
  tmdbId: number;
  title: string;
  subtitle: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string | null;
};

// Default popular titles for quick Match Deck
const INITIAL_MATCH_DECK: MatchDeckCard[] = [
  {
    mediaType: "movie",
    tmdbId: 693134,
    title: "Dune: Deuxième Partie",
    posterPath: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    overview: "Paul Atreides s'unit à Chani et aux Fremen tout en préparant sa revanche contre les conspirateurs qui ont détruit sa famille.",
    year: "2024",
    voteAverage: 8.2
  },
  {
    mediaType: "movie",
    tmdbId: 872585,
    title: "Oppenheimer",
    posterPath: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    overview: "L'histoire du physicien J. Robert Oppenheimer et du Projet Manhattan qui a mené à la création de la première bombe atomique.",
    year: "2023",
    voteAverage: 8.1
  },
  {
    mediaType: "tv",
    tmdbId: 94605,
    title: "Arcane",
    posterPath: "https://image.tmdb.org/t/p/w500/abf8tHznhWW72AG294B0KzT81Yl.jpg",
    overview: "Championnes de leurs villes jumelles en guerre, deux sœurs se battent dans une guerre opposant des technologies magiques et des croyances incompatibles.",
    year: "2024",
    voteAverage: 9.0
  },
  {
    mediaType: "movie",
    tmdbId: 533535,
    title: "Deadpool & Wolverine",
    posterPath: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    overview: "Un Deadpool apathique travaille dur dans le civil, mais son univers fait face à une menace existentielle majeure.",
    year: "2024",
    voteAverage: 7.7
  },
  {
    mediaType: "movie",
    tmdbId: 1022789,
    title: "Vice-Versa 2",
    posterPath: "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
    overview: "Riley désormais adolescente fait face à de nouvelles émotions complexes qui bouleversent le Quartier Général.",
    year: "2024",
    voteAverage: 7.6
  }
];

export function CompanionSocialHub() {
  const { activeProfile, activeProfileId, profiles, profileAvatarUrlsById } = useCompanionProfile();

  const [activeTab, setActiveTab] = useState<"friends" | "match" | "shares" | "privacy">("friends");
  const [loading, setLoading] = useState(true);
  const [graph, setGraph] = useState<SocialGraph | null>(null);
  const [shares, setShares] = useState<{ sent: FriendWatchProposal[]; received: FriendWatchProposal[] }>({ sent: [], received: [] });
  const [matchSessions, setMatchSessions] = useState<FriendMatchSession[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Add friend modal
  const [addFriendModal, setAddFriendModal] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Share movie modal
  const [shareModal, setShareModal] = useState(false);
  const [shareFriendTarget, setShareFriendTarget] = useState<SocialFriend | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TmdbSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Match deck state
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [matchDeck, setMatchDeck] = useState<MatchDeckCard[]>(INITIAL_MATCH_DECK);
  const [selectedFriendForMatch, setSelectedFriendForMatch] = useState<SocialFriend | null>(null);
  const [matchFound, setMatchFound] = useState<MatchDeckCard | null>(null);

  // Load social data
  const loadSocialData = async () => {
    try {
      const q = activeProfileId ? `?profileId=${encodeURIComponent(activeProfileId)}` : "";
      const res = await fetch(`/api/companion/social${q}`);
      const data = await res.json();
      if (data.success) {
        setGraph(data.graph);
        setShares(data.shares || { sent: [], received: [] });
        setMatchSessions(data.matchSessions || []);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSocialData();
  }, [activeProfileId]);

  const copyFriendCode = () => {
    const code = graph?.identity.friendCode || "";
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCodeInput.trim()) return;
    setActionLoading(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch("/api/companion/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_friend_request",
          code: friendCodeInput.trim(),
          fromProfileId: activeProfileId,
          fromProfileName: activeProfile?.name || "Profil"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ text: "Demande d'ami envoyée avec succès !" });
        setFriendCodeInput("");
        setAddFriendModal(false);
        loadSocialData();
      } else {
        setFeedbackMsg({ text: data.error || "Impossible d'envoyer la demande", error: true });
      }
    } catch (_) {
      setFeedbackMsg({ text: "Erreur de connexion", error: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRespondRequest = async (friendshipId: string, accept: boolean) => {
    try {
      await fetch("/api/companion/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "respond_request",
          friendshipId,
          accept
        })
      });
      loadSocialData();
    } catch (_) {}
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    if (!confirm("Voulez-vous vraiment retirer cet ami ?")) return;
    try {
      await fetch("/api/companion/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_friend",
          friendshipId
        })
      });
      loadSocialData();
    } catch (_) {}
  };

  const handlePrivacyToggle = async (key: "ghostMode" | "shareWatching" | "shareWatchlist", value: boolean) => {
    if (!graph) return;
    const patch = { [key]: value };
    setGraph({
      ...graph,
      privacy: { ...graph.privacy, [key]: value }
    });

    try {
      await fetch("/api/companion/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_privacy",
          ...patch
        })
      });
    } catch (_) {
      loadSocialData();
    }
  };

  // Live TMDB Search for Sharing
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/web/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (_) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleProposeWatch = async (item: TmdbSearchResult) => {
    if (!shareFriendTarget) return;
    setActionLoading(true);
    try {
      await fetch("/api/companion/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "propose_watch",
          friendUserId: shareFriendTarget.friendUserId,
          mediaType: item.mediaType,
          tmdbId: item.tmdbId,
          title: item.title,
          posterPath: item.posterUrl,
          backdropPath: item.backdropUrl,
          toProfileId: shareFriendTarget.friendProfileId,
          fromProfileId: activeProfileId,
          fromDisplayName: activeProfile?.name || "Profil"
        })
      });
      setShareModal(false);
      setSearchQuery("");
      setSearchResults([]);
      setFeedbackMsg({ text: `"${item.title}" a été partagé avec ${shareFriendTarget.displayName} !` });
      loadSocialData();
    } catch (_) {
      setFeedbackMsg({ text: "Erreur lors du partage", error: true });
    } finally {
      setActionLoading(false);
    }
  };

  // Match swipe handler
  const handleSwipe = (liked: boolean) => {
    const card = matchDeck[currentDeckIndex];
    if (liked) {
      // Simulate or trigger match logic
      if (Math.random() > 0.4 || currentDeckIndex === 2) {
        setMatchFound(card);
      }
    }
    if (currentDeckIndex < matchDeck.length - 1) {
      setCurrentDeckIndex(currentDeckIndex + 1);
    } else {
      setCurrentDeckIndex(0); // Loop back
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Profile Card & Friend Code Sync */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#121422] via-[#0f111a] to-[#090b10] p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User profile & info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {activeProfile ? (
                <ProfileAvatar
                  profile={activeProfile}
                  avatarUrl={profileAvatarUrlsById[activeProfile.profile_id]}
                  size="lg"
                  label={activeProfile.name || "Profil"}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-xl text-white">
                  M
                </div>
              )}
              {graph?.privacy.ghostMode ? (
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-300 ring-2 ring-[#0f111a]" title="Mode Fantôme activé">
                  <EyeOff size={12} />
                </span>
              ) : (
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-[#0f111a]" title="Visible par vos amis">
                  <Eye size={12} />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{activeProfile?.name || "Profil Principal"}</h2>
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 border border-indigo-500/30">
                  Social MegaTv
                </span>
              </div>
              <p className="mt-0.5 text-xs text-white/50">
                Synchronisé en continu avec votre Android TV et vos appareils mobiles.
              </p>
            </div>
          </div>

          {/* Friend code chip with 1-click copy */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/5 px-4 py-2.5 backdrop-blur-md">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Mon Code Ami</p>
                <p className="font-mono text-base font-black tracking-widest text-cyan-400">
                  {graph?.identity.friendCode || "MEGA-XXXX"}
                </p>
              </div>
              <button
                type="button"
                onClick={copyFriendCode}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
                title="Copier le code"
              >
                {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedCode ? "Copié !" : "Copier"}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAddFriendModal(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg hover:brightness-110 transition-all"
            >
              <UserPlus size={16} />
              <span>Ajouter un ami</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global feedback message banner */}
      {feedbackMsg && (
        <div className={clsx(
          "flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-semibold animate-in fade-in duration-200",
          feedbackMsg.error ? "bg-red-500/15 border border-red-500/30 text-red-300" : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
        )}>
          <span>{feedbackMsg.text}</span>
          <button type="button" onClick={() => setFeedbackMsg(null)} className="opacity-70 hover:opacity-100">×</button>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/8">
        <button
          type="button"
          onClick={() => setActiveTab("friends")}
          className={clsx(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0",
            activeTab === "friends"
              ? "bg-white text-black shadow-md"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Users size={15} />
          <span>Mes Amis</span>
          {graph && graph.friends.length > 0 && (
            <span className={clsx("rounded-full px-2 py-0.5 text-[10px]", activeTab === "friends" ? "bg-black/15 text-black" : "bg-white/15 text-white")}>
              {graph.friends.length}
            </span>
          )}
          {graph && graph.incoming.length > 0 && (
            <span className="rounded-full bg-pink-500 px-1.5 py-0.5 text-[9px] font-black text-white animate-pulse">
              {graph.incoming.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("match")}
          className={clsx(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0",
            activeTab === "match"
              ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Flame size={15} className={activeTab === "match" ? "text-white" : "text-pink-400"} />
          <span>Match Ciné</span>
          <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] text-pink-300 border border-pink-500/30">
            Nouveau
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("shares")}
          className={clsx(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0",
            activeTab === "shares"
              ? "bg-white text-black shadow-md"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Share2 size={15} />
          <span>Films Partagés</span>
          {shares.received.length > 0 && (
            <span className={clsx("rounded-full px-2 py-0.5 text-[10px]", activeTab === "shares" ? "bg-black/15 text-black" : "bg-cyan-500/20 text-cyan-300")}>
              {shares.received.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("privacy")}
          className={clsx(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0",
            activeTab === "privacy"
              ? "bg-white text-black shadow-md"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Shield size={15} />
          <span>Confidentialité</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: FRIENDS LIST */}
      {/* ======================================================== */}
      {activeTab === "friends" && (
        <div className="space-y-6">
          {/* Pending incoming requests section */}
          {graph && graph.incoming.length > 0 && (
            <div className="rounded-3xl border border-pink-500/20 bg-pink-500/5 p-5">
              <h3 className="text-sm font-bold text-pink-300 flex items-center gap-2 mb-3">
                <Sparkles size={16} />
                <span>Demandes d&apos;amis en attente ({graph.incoming.length})</span>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {graph.incoming.map((req) => (
                  <div key={req.friendshipId} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#12141e] p-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center font-bold text-white shrink-0">
                        {req.displayName[0] || "A"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{req.displayName}</p>
                        <p className="text-[11px] font-mono text-white/40">{req.friendCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRespondRequest(req.friendshipId, true)}
                        className="rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                      >
                        Accepter
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRespondRequest(req.friendshipId, false)}
                        className="rounded-xl bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/10 transition-colors"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-white/40">
              <Loader2 size={24} className="animate-spin mr-2" />
              <span>Chargement de vos amis...</span>
            </div>
          ) : graph && graph.friends.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {graph.friends.map((friend) => {
                const avatarSrc = friend.avatarImageStoragePath?.startsWith("http")
                  ? friend.avatarImageStoragePath
                  : friend.avatarImageStoragePath
                  ? `/api/profiles/${encodeURIComponent(friend.friendProfileId || friend.friendUserId)}/avatar`
                  : friend.avatarId > 0
                  ? `/assets/avatars/avatar_${friend.avatarId}.png`
                  : null;

                return (
                  <div
                    key={friend.friendshipId || friend.friendUserId}
                    className="group relative overflow-hidden rounded-3xl border border-white/8 bg-[#10121b] p-5 hover:border-white/20 transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden border border-white/15 bg-white/5 shrink-0">
                          {avatarSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarSrc} alt={friend.displayName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-white">
                              {friend.displayName[0] || "A"}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#10121b]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{friend.displayName}</h4>
                          <p className="font-mono text-[10px] text-white/40">{friend.friendCode}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFriend(friend.friendshipId)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Retirer cet ami"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* What friend is watching */}
                    {friend.nowPlayingTitle ? (
                      <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-white/5 p-2.5 border border-white/6">
                        {friend.nowPlayingPoster ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={friend.nowPlayingPoster} alt="" className="h-10 w-7 rounded object-cover shrink-0" />
                        ) : (
                          <Film size={18} className="text-cyan-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Regarde actuellement</p>
                          <p className="text-xs font-medium text-white truncate">{friend.nowPlayingTitle}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/3 px-3 py-2 text-[11px] text-white/40">
                        <Clock size={13} className="opacity-60" />
                        <span>En ligne sur MegaTv</span>
                      </div>
                    )}

                    {/* Quick action buttons */}
                    <div className="mt-4 grid grid-cols-2 gap-2 pt-2 border-t border-white/6">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFriendForMatch(friend);
                          setActiveTab("match");
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 py-2 text-xs font-semibold transition-colors"
                      >
                        <Flame size={13} />
                        <span>Match</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShareFriendTarget(friend);
                          setShareModal(true);
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-white/8 hover:bg-white/15 text-white py-2 text-xs font-semibold transition-colors"
                      >
                        <Share2 size={13} />
                        <span>Recommander</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/12 bg-white/2 p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400">
                <Users size={28} />
              </div>
              <h3 className="text-base font-bold text-white">Aucun ami pour le moment</h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-white/50">
                Partagez votre code ami <span className="font-mono text-cyan-400 font-bold">{graph?.identity.friendCode}</span> avec vos proches pour voir ce qu&apos;ils regardent et synchroniser vos séances cinéma !
              </p>
              <button
                type="button"
                onClick={() => setAddFriendModal(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-bold text-black shadow-lg hover:bg-white/90 transition-all"
              >
                <UserPlus size={15} />
                <span>Ajouter votre premier ami</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CINEMA MATCH (TINDER FOR MOVIES) */}
      {/* ======================================================== */}
      {activeTab === "match" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/15 px-3 py-1 text-xs font-bold text-pink-400 border border-pink-500/20 mb-2">
              <Flame size={14} /> MegaTv Matchmaking
            </span>
            <h3 className="text-2xl font-black text-white">Qu&apos;est-ce qu&apos;on regarde ce soir ?</h3>
            <p className="text-xs text-white/50 mt-1 max-w-md mx-auto">
              Swiper les films et séries : dès que vous et votre ami aimez le même contenu, c&apos;est un Match instantané !
            </p>
          </div>

          {/* Friend selector for match */}
          {graph && graph.friends.length > 0 && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-semibold text-white/40">Avec :</span>
              <select
                value={selectedFriendForMatch?.friendUserId || ""}
                onChange={(e) => {
                  const f = graph.friends.find((x) => x.friendUserId === e.target.value) || null;
                  setSelectedFriendForMatch(f);
                }}
                className="rounded-xl border border-white/15 bg-[#141622] px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
              >
                <option value="">Tous mes amis (Deck partagé)</option>
                {graph.friends.map((f) => (
                  <option key={f.friendUserId} value={f.friendUserId}>
                    {f.displayName} ({f.friendCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Swipe Card Deck */}
          {matchDeck[currentDeckIndex] && (
            <div className="relative mx-auto w-full max-w-sm rounded-[32px] overflow-hidden border border-white/12 bg-[#121420] shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
              {/* Poster Image */}
              <div className="relative h-96 w-full overflow-hidden bg-black">
                {matchDeck[currentDeckIndex].posterPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={matchDeck[currentDeckIndex].posterPath || ""}
                    alt={matchDeck[currentDeckIndex].title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white/30">
                    <Film size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121420] via-transparent to-black/30" />

                {/* Score badge top right */}
                {matchDeck[currentDeckIndex].voteAverage && (
                  <div className="absolute top-4 right-4 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-amber-400 backdrop-blur-md border border-white/10">
                    ★ {matchDeck[currentDeckIndex].voteAverage?.toFixed(1)}
                  </div>
                )}

                {/* MediaType tag top left */}
                <div className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white uppercase backdrop-blur-md border border-white/10">
                  {matchDeck[currentDeckIndex].mediaType === "tv" ? "Série" : "Film"} · {matchDeck[currentDeckIndex].year}
                </div>
              </div>

              {/* Title & Overview bottom */}
              <div className="p-5 space-y-2">
                <h4 className="text-xl font-black text-white">{matchDeck[currentDeckIndex].title}</h4>
                <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                  {matchDeck[currentDeckIndex].overview}
                </p>
              </div>

              {/* Action Buttons: Pass / Love */}
              <div className="flex items-center justify-center gap-6 p-5 pt-0">
                <button
                  type="button"
                  onClick={() => handleSwipe(false)}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:scale-110 active:scale-95 transition-all shadow-lg"
                  title="Passer"
                >
                  <span className="text-2xl font-bold">✕</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwipe(true)}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:brightness-110 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-pink-500/30"
                  title="J'aime ! Match !"
                >
                  <Heart size={28} className="fill-current" />
                </button>
              </div>
            </div>
          )}

          {/* Match Celebratory Modal */}
          {matchFound && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
              <div className="relative max-w-md w-full rounded-3xl border border-pink-500/40 bg-gradient-to-b from-[#221020] via-[#151224] to-[#0c0e18] p-6 text-center text-white shadow-[0_25px_80px_rgba(244,63,94,0.35)]">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 animate-bounce">
                  <Flame size={32} />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white">C&apos;est un MATCH ! 🎉</h3>
                <p className="mt-1 text-xs text-white/60">
                  Vous et {selectedFriendForMatch?.displayName || "votre ami"} voulez regarder le même titre :
                </p>

                <div className="my-5 flex items-center gap-3 rounded-2xl bg-white/8 p-3 text-left border border-white/10">
                  {matchFound.posterPath && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={matchFound.posterPath} alt="" className="h-16 w-11 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate">{matchFound.title}</p>
                    <p className="text-xs text-white/40">{matchFound.year}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/web/details/${matchFound.mediaType}-${matchFound.tmdbId}`}
                    className="flex-1 rounded-2xl bg-white px-4 py-3 text-xs font-bold text-black hover:bg-white/90 text-center"
                  >
                    Lancer sur MegaTv Web
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMatchFound(null)}
                    className="rounded-2xl border border-white/15 px-4 py-3 text-xs font-semibold text-white/70 hover:text-white"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SHARED FILMS / RECOMMENDATIONS */}
      {/* ======================================================== */}
      {activeTab === "shares" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Recommandations &amp; Propositions de films</h3>
              <p className="text-xs text-white/50">
                Films et séries conseillés par vos amis ou que vous leur avez envoyés.
              </p>
            </div>
            {graph && graph.friends.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShareFriendTarget(graph.friends[0]);
                  setShareModal(true);
                }}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:brightness-110 transition-all shadow-md"
              >
                <Share2 size={14} />
                <span>Recommander un film</span>
              </button>
            )}
          </div>

          {/* Received titles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Reçus de vos amis</h4>
            {shares.received.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {shares.received.map((prop) => (
                  <div key={prop.id} className="flex gap-3 rounded-2xl border border-white/8 bg-[#10121b] p-3 hover:border-white/15 transition-all">
                    {prop.posterPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prop.posterPath} alt="" className="h-20 w-14 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="h-20 w-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <Film size={20} className="text-white/30" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-semibold text-cyan-400">Recommandé par {prop.fromDisplayName}</p>
                        <h5 className="text-sm font-bold text-white truncate">{prop.title}</h5>
                        <p className="text-[11px] text-white/40 uppercase">{prop.mediaType === "tv" ? "Série" : "Film"}</p>
                      </div>
                      <Link
                        href={`/web/details/${prop.mediaType}-${prop.tmdbId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300"
                      >
                        <span>Voir la fiche</span>
                        <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 italic p-4 rounded-2xl bg-white/2 border border-white/5">
                Aucune recommandation reçue pour le moment. Vos amis peuvent vous proposer des films directement depuis leur application MegaTv !
              </p>
            )}
          </div>

          {/* Sent titles */}
          <div className="pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Envoyés à vos amis</h4>
            {shares.sent.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {shares.sent.map((prop) => (
                  <div key={prop.id} className="flex gap-3 rounded-2xl border border-white/8 bg-[#10121b] p-3">
                    {prop.posterPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prop.posterPath} alt="" className="h-20 w-14 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="h-20 w-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <Film size={20} className="text-white/30" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-white truncate">{prop.title}</h5>
                        <p className="text-[10px] text-white/40">{new Date(prop.createdAt).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Recommandation envoyée
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 italic p-4 rounded-2xl bg-white/2 border border-white/5">
                Vous n&apos;avez pas encore partagé de film ou de série.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PRIVACY SETTINGS */}
      {/* ======================================================== */}
      {activeTab === "privacy" && graph && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#10121a] p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield size={18} className="text-indigo-400" />
              <span>Confidentialité Sociale</span>
            </h3>

            {/* Ghost Mode Toggle */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-white/6">
              <div>
                <p className="text-sm font-bold text-white">Mode Fantôme (Ghost Mode)</p>
                <p className="text-xs text-white/50">
                  Masque complètement votre activité de visionnage en direct et vos titres en cours à vos amis.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handlePrivacyToggle("ghostMode", !graph.privacy.ghostMode)}
                className={clsx(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  graph.privacy.ghostMode ? "bg-indigo-600" : "bg-white/20"
                )}
              >
                <span
                  className={clsx(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                    graph.privacy.ghostMode ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Share Watching Toggle */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-white/6">
              <div>
                <p className="text-sm font-bold text-white">Partager mes lectures en cours</p>
                <p className="text-xs text-white/50">
                  Affiche sur l&apos;avatar de vos amis une bague d&apos;activité lorsque vous regardez un film.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handlePrivacyToggle("shareWatching", !graph.privacy.shareWatching)}
                className={clsx(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  graph.privacy.shareWatching ? "bg-cyan-600" : "bg-white/20"
                )}
              >
                <span
                  className={clsx(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                    graph.privacy.shareWatching ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Share Watchlist Toggle */}
            <div className="flex items-center justify-between gap-4 py-2">
              <div>
                <p className="text-sm font-bold text-white">Partager ma Watchlist</p>
                <p className="text-xs text-white/50">
                  Permet à vos amis d&apos;explorer vos listes à voir pour vous suggérer des séances communes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handlePrivacyToggle("shareWatchlist", !graph.privacy.shareWatchlist)}
                className={clsx(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  graph.privacy.shareWatchlist ? "bg-cyan-600" : "bg-white/20"
                )}
              >
                <span
                  className={clsx(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                    graph.privacy.shareWatchlist ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD FRIEND MODAL */}
      {/* ======================================================== */}
      {addFriendModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-[#141624] border border-white/12 p-6 shadow-2xl text-white">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <UserPlus size={18} className="text-cyan-400" />
              <span>Ajouter un ami</span>
            </h3>
            <p className="text-xs text-white/50 mb-5">
              Saisissez le code ami MegaTv partagé par votre contact (ex: MEGA-1234).
            </p>

            <form onSubmit={handleSendFriendRequest} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={friendCodeInput}
                onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())}
                placeholder="MEGA-XXXX"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-mono font-bold tracking-widest text-cyan-300 placeholder:text-white/25 focus:outline-none focus:border-cyan-400"
              />

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAddFriendModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-white/60 hover:text-white"
                >
                  Annuler
                </button>
                <MegaButton type="submit" disabled={actionLoading || !friendCodeInput.trim()} className="min-w-28">
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  <span>Envoyer</span>
                </MegaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SHARE / RECOMMEND MOVIE MODAL */}
      {/* ======================================================== */}
      {shareModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl bg-[#141624] border border-white/12 shadow-2xl text-white overflow-hidden">
            <div className="p-6 border-b border-white/8">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 size={16} className="text-cyan-400" />
                <span>Recommander à {shareFriendTarget?.displayName || "un ami"}</span>
              </h3>
              <p className="text-xs text-white/50 mt-1">
                Recherchez un titre dans le catalogue mondial TMDB pour lui envoyer directement.
              </p>

              {/* Search input */}
              <div className="relative mt-3">
                <Search size={15} className="absolute left-3.5 top-3 text-white/40" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Titre du film ou de la série..."
                  className="w-full rounded-xl bg-white/8 border border-white/10 pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400"
                />
                {isSearching && <Loader2 size={14} className="absolute right-3.5 top-3 animate-spin text-white/40" />}
              </div>
            </div>

            {/* Results list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {searchResults.map((item) => (
                <div
                  key={item.mediaId}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-white/4 hover:bg-white/8 border border-white/5 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.posterUrl} alt="" className="h-14 w-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="h-14 w-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <Film size={16} className="text-white/30" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{item.title}</p>
                      <p className="text-[11px] text-white/40 uppercase">{item.mediaType} · {item.subtitle}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleProposeWatch(item)}
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:brightness-110 shrink-0"
                  >
                    Envoyer
                  </button>
                </div>
              ))}

              {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                <p className="text-center py-8 text-xs text-white/40">Aucun résultat trouvé pour cette recherche.</p>
              )}
            </div>

            <div className="p-4 border-t border-white/8 flex justify-end">
              <button
                type="button"
                onClick={() => setShareModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-white/60 hover:text-white"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
