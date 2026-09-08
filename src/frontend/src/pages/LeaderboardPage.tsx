import { useActor } from "@caffeineai/core-infrastructure";
import { Heart, RefreshCw, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createActor } from "../backend";
import type { LeaderboardEntry, UserProfile } from "../lib/types";

interface LeaderboardPageProps {
  profile: UserProfile | null;
}

type LeaderboardTab = "weekly" | "monthly";

function getRankBadge(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function getRankStyles(rank: number): string {
  if (rank === 1)
    return "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 shadow-primary/10";
  if (rank === 2)
    return "bg-gradient-to-br from-muted to-card border-border shadow-muted/60";
  if (rank === 3)
    return "bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30 shadow-accent/10";
  return "bg-card border-border";
}

function SkeletonRow() {
  return (
    <div className="bg-card rounded-[2rem] border border-border p-4 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0" />
      <div className="w-14 h-14 bg-muted rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-muted rounded-full w-28" />
        <div className="h-2 bg-muted rounded-full w-16" />
      </div>
      <div className="w-12 h-6 bg-muted rounded-full" />
    </div>
  );
}

interface EntryListProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  emptyMessage: string;
  profile: UserProfile | null;
}

function EntryList({
  entries,
  isLoading,
  emptyMessage,
  profile,
}: EntryListProps) {
  if (isLoading) {
    return (
      <div
        className="space-y-3"
        data-ocid="leaderboard.loading_state"
        aria-label="Loading leaderboard..."
      >
        {(["s1", "s2", "s3", "s4", "s5"] as const).map((k) => (
          <SkeletonRow key={k} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div
        className="py-24 px-10 text-center flex flex-col items-center fade-in"
        data-ocid="leaderboard.empty_state"
      >
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-5xl mb-6 border-4 border-card shadow-pookie-lg">
          🏆
        </div>
        <p className="text-foreground font-bold text-lg mb-2">{emptyMessage}</p>
        <p className="text-muted-foreground font-bold text-xs leading-relaxed italic max-w-[260px]">
          Be the first to post a smile and claim the top spot! 🌟
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="leaderboard.list">
      {entries.map((entry, i) => {
        const isCurrentUser = profile?.uid && entry.userId === profile.uid;
        const isTopThree = entry.rank <= 3;
        return (
          <article
            key={entry.smileId}
            className={`rounded-[2rem] border p-4 flex items-center gap-4 shadow-pookie transition-smooth ${getRankStyles(entry.rank)} ${isCurrentUser ? "ring-2 ring-primary ring-offset-2" : ""}`}
            style={{ animationDelay: `${i * 0.06}s` }}
            data-ocid={`leaderboard.item.${i + 1}`}
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-black ${isTopThree ? "text-2xl" : "bg-muted text-foreground text-sm border border-border"}`}
            >
              {getRankBadge(entry.rank)}
            </div>
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-border shadow-xs">
              <img
                src={entry.imageBlobId}
                alt={`Smile by ${entry.userName}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/assets/images/placeholder.svg";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-[13px] text-foreground truncate">
                  {entry.userName}
                </p>
                {isCurrentUser && (
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
                    You
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 truncate">
                {entry.userCountry}
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-xl flex-shrink-0">
              <Heart
                size={14}
                className="text-primary fill-primary flex-shrink-0"
              />
              <span className="text-xs font-black text-primary">
                {entry.likes}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function LeaderboardPage({ profile }: LeaderboardPageProps) {
  const { actor } = useActor(createActor);
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("weekly");
  const [weeklyEntries, setWeeklyEntries] = useState<LeaderboardEntry[]>([]);
  const [monthlyEntries, setMonthlyEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(true);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [monthlyFetched, setMonthlyFetched] = useState(false);

  const fetchWeekly = useCallback(async () => {
    if (!actor) return;
    try {
      const raw = await actor.getWeeklyLeaderboard();
      setWeeklyEntries(
        raw.map((e) => ({
          rank: Number(e.rank),
          smileId: e.smileId,
          userId: e.userId,
          userName: e.userName,
          userCountry: e.userCountry,
          imageBlobId: e.imageBlobId,
          likes: Number(e.likes),
          createdAt: Number(e.createdAt / 1_000_000n),
        })),
      );
    } catch {
      // silently fail
    } finally {
      setIsLoadingWeekly(false);
      setIsRefreshing(false);
    }
  }, [actor]);

  const fetchMonthly = useCallback(async () => {
    if (!actor) return;
    setIsLoadingMonthly(true);
    try {
      const raw = await actor.getMonthlyLeaderboard();
      setMonthlyEntries(
        raw.map((e) => ({
          rank: Number(e.rank),
          smileId: e.smileId,
          userId: e.userId,
          userName: e.userName,
          userCountry: e.userCountry,
          imageBlobId: e.imageBlobId,
          likes: Number(e.likes),
          createdAt: Number(e.createdAt / 1_000_000n),
        })),
      );
    } catch {
      // silently fail
    } finally {
      setIsLoadingMonthly(false);
      setIsRefreshing(false);
    }
  }, [actor]);

  // Initial weekly fetch
  useEffect(() => {
    void fetchWeekly();
  }, [fetchWeekly]);

  // Fetch monthly when tab switches (once)
  useEffect(() => {
    if (activeTab === "monthly" && !monthlyFetched) {
      setMonthlyFetched(true);
      void fetchMonthly();
    }
  }, [activeTab, fetchMonthly, monthlyFetched]);

  // Auto-refresh every 10s
  useEffect(() => {
    const id = setInterval(() => {
      if (activeTab === "weekly") void fetchWeekly();
      else void fetchMonthly();
    }, 10_000);
    return () => clearInterval(id);
  }, [activeTab, fetchWeekly, fetchMonthly]);

  const handleRefresh = () => {
    if (isRefreshing || isLoadingWeekly || isLoadingMonthly) return;
    setIsRefreshing(true);
    if (activeTab === "weekly") void fetchWeekly();
    else void fetchMonthly();
  };

  const tabs: { id: LeaderboardTab; label: string; emoji: string }[] = [
    { id: "weekly", label: "Weekly", emoji: "⚡" },
    { id: "monthly", label: "Monthly All-Time", emoji: "🏆" },
  ];

  return (
    <div className="p-4 space-y-6 fade-in" data-ocid="leaderboard.page">
      {/* Header */}
      <div className="flex items-end justify-between px-2 mb-2">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-1 block">
            Top Smilers
          </span>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Leaderboard{" "}
            <Trophy size={22} className="text-primary fill-primary/30" />
          </h2>
          <p className="text-[11px] text-muted-foreground font-bold mt-1">
            Who's spreading the most joy? ✨
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoadingWeekly || isLoadingMonthly}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-muted border border-border text-muted-foreground transition-smooth active:scale-90 disabled:opacity-50"
          data-ocid="leaderboard.refresh_button"
          aria-label="Refresh leaderboard"
        >
          <RefreshCw
            size={18}
            className={
              isRefreshing || isLoadingWeekly || isLoadingMonthly
                ? "animate-spin"
                : ""
            }
          />
        </button>
      </div>

      {/* Tab switcher */}
      <div
        className="flex bg-muted p-1 rounded-2xl"
        role="tablist"
        data-ocid="leaderboard.tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-smooth flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-pookie"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`leaderboard.${tab.id}.tab`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content with smooth transition */}
      <div className="fade-in" key={activeTab}>
        {activeTab === "weekly" && (
          <>
            <EntryList
              entries={weeklyEntries}
              isLoading={isLoadingWeekly}
              emptyMessage="No smiles yet this week pookie! 🎀"
              profile={profile}
            />
            {!isLoadingWeekly && weeklyEntries.length > 0 && (
              <p className="text-center text-[10px] font-bold text-muted-foreground/60 pt-4">
                Leaderboard resets every Monday 🌟 Keep smiling!
              </p>
            )}
          </>
        )}
        {activeTab === "monthly" && (
          <>
            <EntryList
              entries={monthlyEntries}
              isLoading={isLoadingMonthly}
              emptyMessage="No all-time champions yet pookie! 🏆"
              profile={profile}
            />
            {!isLoadingMonthly && monthlyEntries.length > 0 && (
              <p className="text-center text-[10px] font-bold text-muted-foreground/60 pt-4">
                All-time most-loved smiles 💖 Keep posting!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
