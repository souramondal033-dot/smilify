import { useActor } from "@caffeineai/core-infrastructure";
import {
  Check,
  Edit3,
  Flame,
  Globe,
  Heart,
  Link,
  MapPin,
  RefreshCw,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createActor } from "../backend";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { useTrending } from "../hooks/useTrending";
import { ASSETS } from "../lib/constants";
import type { Smile, View } from "../lib/types";

// ─── Types ───────────────────────────────────────────────────────────────────

type FeedTab = "global" | "personal";

interface WallPageProps {
  smiles: Smile[];
  mySmiles?: Smile[];
  currentUid?: string;
  currentUserName?: string;
  setView: (v: View) => void;
  onToast: (msg: string) => void;
  onLike?: (smileId: string) => void;
  onDelete?: (smileId: string) => void;
  onEdit?: (smileId: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  highlightSmileId?: string | null;
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatTime(createdAt?: { seconds: number }): string {
  if (!createdAt) return "";
  return new Date(createdAt.seconds * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Session-scoped set of viewed smile IDs to avoid duplicate calls
const viewedThisSession = new Set<string>();

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  name,
  picUrl,
  size = 9,
}: {
  name?: string;
  picUrl?: string | null;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = size === 9 ? "w-9 h-9" : "w-10 h-10";

  if (picUrl && !imgError) {
    return (
      <img
        src={picUrl}
        alt={name ?? "user"}
        className={`${sizeClass} rounded-full object-cover ring-4 ring-primary/10 flex-shrink-0`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[11px] uppercase ring-4 ring-primary/10 flex-shrink-0`}
    >
      {name?.charAt(0) ?? <User size={12} />}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="bg-card rounded-[2.5rem] overflow-hidden border border-border animate-pulse"
      aria-hidden="true"
    >
      <div className="px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-muted" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-muted rounded-full w-28" />
          <div className="h-2 bg-muted rounded-full w-16" />
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="rounded-[2rem] aspect-square bg-muted" />
      </div>
      <div className="px-8 pb-8 flex items-center justify-between">
        <div className="h-8 w-20 bg-muted rounded-2xl" />
        <div className="h-3 w-12 bg-muted rounded-full" />
      </div>
    </div>
  );
}

// ─── Trending Card (horizontal strip) ─────────────────────────────────────────

function TrendingCard({ smile, rank }: { smile: Smile; rank: number }) {
  return (
    <div
      className="relative flex-shrink-0 w-32 rounded-[1.5rem] overflow-hidden bg-card border border-border shadow-pookie group cursor-pointer"
      data-ocid={`wall.trending_card.item.${rank}`}
    >
      <img
        src={smile.image}
        alt={`Trending smile by ${smile.userName}`}
        className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = ASSETS.LOGO;
        }}
      />
      {/* Flame badge */}
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-full px-2 py-0.5 border border-primary/30">
        <Flame size={10} className="text-primary" />
        <span className="text-[9px] font-bold text-primary">{rank}</span>
      </div>
      <div className="px-2 py-2">
        <div className="flex items-center gap-1.5">
          <Avatar name={smile.userName} picUrl={smile.profilePicUrl} size={9} />
          <p className="text-[10px] font-bold text-foreground truncate">
            {smile.userName}
          </p>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Heart size={9} className="fill-primary text-primary" />
          <span className="text-[9px] font-bold text-primary">
            {smile.likes}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Trending Section ─────────────────────────────────────────────────────────

function TrendingSection() {
  const { trendingSmiles, isLoading } = useTrending();

  if (isLoading && trendingSmiles.length === 0) {
    return (
      <div className="mb-4" data-ocid="wall.trending_section">
        <div className="flex items-center gap-2 px-2 mb-3">
          <Flame size={14} className="text-primary" />
          <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">
            Trending
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-32 h-44 rounded-[1.5rem] bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!isLoading && trendingSmiles.length === 0) return null;

  return (
    <div
      className="mb-4 fade-in"
      data-ocid="wall.trending_section"
      aria-label="Trending smiles"
    >
      <div className="flex items-center gap-2 px-2 mb-3">
        <Flame size={14} className="text-primary" />
        <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">
          Trending 🔥
        </span>
        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
          — this week
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
        {trendingSmiles.slice(0, 5).map((smile, i) => (
          <TrendingCard key={smile.id} smile={smile} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}

// ─── SmileCard ────────────────────────────────────────────────────────────────

interface SmileCardProps {
  smile: Smile;
  index: number;
  onLike: (id: string) => void;
  onToast: (msg: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  isHighlighted?: boolean;
  isOwner?: boolean;
  onView?: (id: string) => void;
}

function SmileCard({
  smile,
  index,
  onLike,
  onToast,
  onDelete,
  onEdit,
  isHighlighted,
  isOwner,
  onView,
}: SmileCardProps) {
  const [localLikes, setLocalLikes] = useState(smile.likes);
  const [liked, setLiked] = useState(false);
  const [copied, copyToClipboard] = useCopyToClipboard();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  // Intersection observer — record a view once per session per smile
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !onView || viewedThisSession.has(smile.id)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !viewedThisSession.has(smile.id)) {
          viewedThisSession.add(smile.id);
          onView(smile.id);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [smile.id, onView]);

  const handleLike = () => {
    if (liked) return;
    setLiked(true);
    setLocalLikes((prev) => prev + 1);
    onLike(smile.id);
  };

  const handleShare = async () => {
    const inviteCode = smile.inviteCode?.[0];
    if (!inviteCode) {
      onToast("No share link available yet pookie! 🎀");
      return;
    }
    const link = `${window.location.origin}?invite=${encodeURIComponent(inviteCode)}`;
    await copyToClipboard(link);
    onToast("Share link copied! Send it to a friend pookie 🎀");
  };

  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    } else {
      onDelete?.(smile.id);
      setConfirmDelete(false);
    }
  };

  return (
    <article
      ref={cardRef}
      className={`bg-card rounded-[2.5rem] overflow-hidden shadow-pookie border transition-smooth fade-in zoom-in ${
        isHighlighted
          ? "border-primary ring-2 ring-primary/40 shadow-pookie-lg"
          : "border-border"
      }`}
      style={{ animationDelay: `${index * 0.08}s` }}
      data-ocid={`wall.smile_card.item.${index + 1}`}
      id={`smile-${smile.id}`}
    >
      {/* User header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={smile.userName} picUrl={smile.profilePicUrl} size={9} />
          <div className="min-w-0">
            <p className="font-bold text-[13px] text-foreground leading-none truncate">
              {smile.userName}
            </p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-1">
              <Globe size={8} />
              {smile.country}
            </p>
            {(smile.region || smile.state) && (
              <p className="text-[9px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin size={8} className="flex-shrink-0" />
                <span className="truncate">
                  {[smile.region, smile.state, smile.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Action row: owner controls + share */}
        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => onEdit?.(smile.id)}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-border bg-muted hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-smooth active:scale-90"
                data-ocid={`wall.edit_button.${index + 1}`}
                aria-label={`Edit smile ${index + 1}`}
              >
                <Edit3 size={13} />
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-smooth active:scale-90 ${
                  confirmDelete
                    ? "bg-destructive/10 border-destructive/40 text-destructive animate-pulse"
                    : "bg-muted border-border text-muted-foreground hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
                }`}
                data-ocid={`wall.delete_button.${index + 1}`}
                aria-label={
                  confirmDelete
                    ? "Tap again to confirm delete"
                    : `Delete smile ${index + 1}`
                }
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
          {smile.inviteCode?.[0] && (
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted hover:bg-primary/10 hover:border-primary/30 transition-smooth active:scale-90 text-muted-foreground hover:text-primary"
              data-ocid={`wall.share_button.${index + 1}`}
              aria-label={`Share smile by ${smile.userName}`}
            >
              {copied ? (
                <Check size={13} className="text-primary" />
              ) : (
                <Link size={13} />
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {copied ? "Copied!" : "Share"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Smile image */}
      <div className="px-4 pb-4">
        <div className="rounded-[2rem] overflow-hidden aspect-square relative group">
          <img
            src={smile.image}
            alt={`Smile by ${smile.userName}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = ASSETS.LOGO;
            }}
          />
          {isHighlighted && (
            <div className="absolute inset-0 ring-4 ring-primary/30 rounded-[2rem] pointer-events-none" />
          )}
          {/* Confirm delete overlay */}
          {confirmDelete && (
            <div className="absolute inset-0 bg-destructive/10 backdrop-blur-sm rounded-[2rem] flex items-center justify-center">
              <div className="bg-card border border-destructive/40 rounded-2xl px-4 py-3 text-center shadow-pookie">
                <p className="text-[11px] font-bold text-destructive mb-1">
                  Delete this smile?
                </p>
                <p className="text-[9px] text-muted-foreground">
                  Tap 🗑 again to confirm
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="px-8 pb-8 flex items-center justify-between">
        <button
          type="button"
          onClick={handleLike}
          disabled={liked}
          className="flex items-center gap-3 px-6 py-3 bg-muted rounded-2xl transition-smooth active:scale-90 group disabled:opacity-80"
          data-ocid={`wall.like_button.${index + 1}`}
          aria-label={`Like smile by ${smile.userName}`}
        >
          <Heart
            size={20}
            className={
              liked || localLikes > 0
                ? "fill-primary text-primary"
                : "text-muted-foreground group-hover:scale-110 transition-smooth"
            }
          />
          <span className="text-xs font-bold text-primary">{localLikes}</span>
        </button>
        <div className="flex items-center gap-3">
          {(smile.views ?? 0) > 0 && (
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
              {smile.views} views
            </span>
          )}
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {formatTime(smile.createdAt)}
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Feed Toggle ──────────────────────────────────────────────────────────────

function FeedToggle({
  active,
  onChange,
}: {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
}) {
  return (
    <div
      className="flex items-center gap-1.5 bg-muted rounded-2xl p-1.5"
      role="tablist"
      aria-label="Feed type"
      data-ocid="wall.feed_toggle"
    >
      {(["global", "personal"] as FeedTab[]).map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-smooth ${
            active === tab
              ? "gradient-pink-rose text-primary-foreground shadow-pookie"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-ocid={`wall.feed_toggle.${tab}`}
        >
          <span>{tab === "global" ? "🌍" : "🤳"}</span>
          <span>{tab === "global" ? "Global" : "Personal"}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  tab,
  setView,
}: {
  tab: FeedTab;
  setView: (v: View) => void;
}) {
  return (
    <div
      className="py-24 px-10 text-center flex flex-col items-center fade-in"
      data-ocid="wall.empty_state"
    >
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-primary mb-6 border-4 border-card shadow-pookie-lg">
        <Sparkles size={32} className="animate-pulse" />
      </div>
      {tab === "global" ? (
        <>
          <p className="text-foreground font-bold text-lg mb-2">
            The world is waiting pookie! 🌎✨
          </p>
          <p className="text-muted-foreground font-bold text-xs leading-relaxed italic max-w-[260px]">
            Upload your first smile to start the chain. Let's share some
            happiness! 🎀
          </p>
        </>
      ) : (
        <>
          <p className="text-foreground font-bold text-lg mb-2">
            No smiles yet pookie! 🤳✨
          </p>
          <p className="text-muted-foreground font-bold text-xs leading-relaxed italic max-w-[260px]">
            Your personal feed is empty — take a selfie and share your happiness
            with the world! 🎀
          </p>
        </>
      )}
      <button
        type="button"
        onClick={() => setView("camera")}
        className="mt-8 px-8 py-4 gradient-pink-rose text-primary-foreground rounded-[2rem] font-bold text-[11px] uppercase tracking-widest shadow-pookie-lg active:scale-90 transition-smooth"
        data-ocid="wall.start_chain_button"
      >
        {tab === "global" ? "Start Chain" : "Share a Smile"}
      </button>
    </div>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      aria-modal="true"
      aria-label="Delete smile confirmation"
      data-ocid="wall.delete_modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onCancel}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
        tabIndex={-1}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative bg-card rounded-[2rem] shadow-pookie-lg border border-border p-8 w-full max-w-sm text-center space-y-4 fade-in zoom-in">
        <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto border border-destructive/30">
          <Trash2 size={24} className="text-destructive" />
        </div>
        <div>
          <p className="text-foreground font-bold text-base mb-1">
            Delete this smile? 🥺
          </p>
          <p className="text-muted-foreground text-xs">
            This can&apos;t be undone pookie
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-muted border border-border text-foreground font-bold text-xs uppercase tracking-wider transition-smooth active:scale-90 hover:bg-muted/70"
            data-ocid="wall.delete_modal.cancel_button"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-destructive/90 hover:bg-destructive text-white font-bold text-xs uppercase tracking-wider transition-smooth active:scale-90 shadow-pookie"
            data-ocid="wall.delete_modal.confirm_button"
          >
            Delete 🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WallPage({
  smiles,
  mySmiles,
  currentUid,
  currentUserName,
  setView,
  onToast,
  onLike,
  onDelete,
  onEdit,
  isLoading = false,
  onRefresh,
  highlightSmileId,
}: WallPageProps) {
  void currentUserName;
  const [activeTab, setActiveTab] = useState<FeedTab>("global");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { actor } = useActor(createActor);

  const handleRefresh = () => {
    if (isRefreshing || isLoading) return;
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 800);
    onToast("Feed refreshed pookie! 🎀");
  };

  const handleLike = (smileId: string) => {
    onLike?.(smileId);
  };

  const handleDeleteConfirm = useCallback(
    async (smileId: string) => {
      setDeleteConfirmId(null);
      if (!actor) {
        onToast("Couldn't delete this smile 😕 Try again");
        return;
      }
      try {
        await actor.deleteSmile(smileId);
        onDelete?.(smileId);
        onToast("Smile deleted pookie 🗑️");
      } catch {
        onToast("Couldn't delete this smile 😕 Try again");
      }
    },
    [actor, onDelete, onToast],
  );

  const handleView = useCallback(
    async (smileId: string) => {
      if (!actor) return;
      try {
        await actor.recordSmileView(smileId);
      } catch {
        // fire-and-forget, ignore errors
      }
    },
    [actor],
  );

  const handleShare = useCallback(
    async (smileId: string) => {
      if (!actor) return;
      try {
        await actor.recordSmileShare(smileId);
      } catch {
        // fire-and-forget
      }
    },
    [actor],
  );

  // Augment SmileCard's share to also call recordSmileShare
  // We inject this via the onToast pathway — instead we provide a share handler
  // that SmileCard can call after copying. We pass it down via a wrapper.
  // Since SmileCard calls copyToClipboard internally, we call handleShare from onView
  // perspective separately: the share count callback is via handleShareRecord prop.

  // Determine displayed feed items
  const isPersonal = activeTab === "personal";
  let feedSmiles: Smile[];
  if (isPersonal) {
    // Use mySmiles prop if provided, otherwise filter global by uid
    if (mySmiles) {
      feedSmiles = mySmiles;
    } else if (currentUid) {
      feedSmiles = smiles.filter((s) => s.userId === currentUid);
    } else {
      feedSmiles = [];
    }
  } else {
    feedSmiles = smiles;
  }

  const showLoading = isLoading && feedSmiles.length === 0;
  const showEmpty = !isLoading && feedSmiles.length === 0;

  return (
    <div className="p-4 space-y-4" data-ocid="wall.page">
      {/* Page header */}
      <div className="flex items-end justify-between px-2 mb-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-1">
            {isPersonal ? "My Smiles" : "Global Wall"}
          </span>
          <h2 className="text-2xl font-bold text-foreground">
            {isPersonal ? "My Feed 🤳" : "Happiness Chain 🎀"}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-muted border border-border text-muted-foreground transition-smooth active:scale-90 disabled:opacity-50"
          data-ocid="wall.refresh_button"
          aria-label="Refresh feed"
        >
          <RefreshCw
            size={18}
            className={isRefreshing || isLoading ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* Feed toggle */}
      <FeedToggle active={activeTab} onChange={setActiveTab} />

      {/* Loading skeletons */}
      {showLoading && (
        <div
          className="space-y-6"
          data-ocid="wall.loading_state"
          aria-label="Loading smiles..."
        >
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Global feed: trending strip + chronological */}
      {!showLoading && !isPersonal && (
        <>
          <TrendingSection />
          {showEmpty ? (
            <EmptyState tab="global" setView={setView} />
          ) : (
            <div className="space-y-6" data-ocid="wall.smiles_list">
              {feedSmiles.map((smile, i) => (
                <SmileCard
                  key={smile.id}
                  smile={smile}
                  index={i}
                  onLike={handleLike}
                  onToast={(msg) => {
                    // if share toast, also record share
                    if (msg.includes("Share link copied")) {
                      void handleShare(smile.id);
                    }
                    onToast(msg);
                  }}
                  isHighlighted={highlightSmileId === smile.id}
                  isOwner={!!currentUid && smile.userId === currentUid}
                  onDelete={(id) => setDeleteConfirmId(id)}
                  onEdit={onEdit}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Personal feed */}
      {!showLoading &&
        isPersonal &&
        (showEmpty ? (
          <EmptyState tab="personal" setView={setView} />
        ) : (
          <div className="space-y-6" data-ocid="wall.personal_smiles_list">
            {feedSmiles.map((smile, i) => (
              <SmileCard
                key={smile.id}
                smile={smile}
                index={i}
                onLike={handleLike}
                onToast={(msg) => {
                  if (msg.includes("Share link copied")) {
                    void handleShare(smile.id);
                  }
                  onToast(msg);
                }}
                isHighlighted={highlightSmileId === smile.id}
                isOwner
                onDelete={onDelete}
                onEdit={onEdit}
                onView={handleView}
              />
            ))}
          </div>
        ))}
      {/* Delete confirm modal */}
      {deleteConfirmId && (
        <DeleteConfirmModal
          onConfirm={() => void handleDeleteConfirm(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}
