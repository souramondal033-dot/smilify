import {
  Award,
  Copy,
  Globe,
  LayoutGrid,
  LogOut,
  Mail,
  Settings,
  Share2,
  Smile,
  Zap,
} from "lucide-react";
import { useState } from "react";
import type { Badge, UserProfile, View } from "../lib/types";
import { getInitial } from "../lib/utils";

interface ProfilePageProps {
  profile: UserProfile | null;
  onLogout: () => void;
  onNavigate: (v: View) => void;
}

export function ProfilePage({
  profile,
  onLogout,
  onNavigate,
}: ProfilePageProps) {
  if (!profile) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 px-8 text-center fade-in"
        data-ocid="profile.empty_state"
      >
        <div className="text-6xl mb-4 animate-bounce-gentle">🐼</div>
        <p className="text-foreground font-bold text-lg mb-2">
          Not signed in pookie! 🎀
        </p>
        <p className="text-muted-foreground text-sm font-bold">
          Sign in to see your profile ✨
        </p>
      </div>
    );
  }

  const badges = profile.badges ?? [];
  const currentStreak = Number(profile.currentStreak ?? 0n);

  return (
    <div className="p-8 space-y-8 fade-in">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center text-center pt-4">
        <div className="relative mb-6">
          {profile.profilePicUrl ? (
            <img
              src={profile.profilePicUrl}
              alt={profile.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-background shadow-pookie-lg"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-pookie-lg">
              <span className="text-4xl font-bold">
                {getInitial(profile.name)}
              </span>
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-card rounded-[1.2rem] flex items-center justify-center border-4 border-background shadow-pookie">
            <Award size={18} className="text-primary" />
          </div>
        </div>

        <h3 className="text-3xl font-bold text-foreground tracking-tight">
          {profile.name}
        </h3>

        <div className="flex items-center gap-2 px-4 py-2 bg-muted/60 rounded-full mt-3 border border-border">
          <Globe size={12} className="text-muted-foreground" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {profile.country}
          </span>
        </div>

        {currentStreak > 0 && (
          <div className="flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
            <span className="text-base">🔥</span>
            <span className="text-[11px] font-black text-primary uppercase tracking-widest">
              {currentStreak} day streak
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-5 w-full max-w-xs">
          <button
            type="button"
            onClick={() => onNavigate("account-settings")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-[11px] uppercase tracking-widest shadow-pookie hover:opacity-90 transition-smooth"
            data-ocid="profile.edit_profile_button"
          >
            <Settings size={13} /> Edit Profile
          </button>
          <button
            type="button"
            onClick={() => onNavigate("content-hub")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-border bg-muted/60 text-foreground font-bold text-[11px] uppercase tracking-widest hover:bg-muted transition-smooth"
            data-ocid="profile.content_hub_button"
          >
            <LayoutGrid size={13} /> My Content
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4" data-ocid="profile.stats.section">
        <div
          className="bg-card p-6 rounded-[2.5rem] border border-border shadow-xs text-center"
          data-ocid="profile.tokens.card"
        >
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-pookie">
            <Zap size={18} className="text-primary-foreground fill-current" />
          </div>
          <p className="text-2xl font-bold text-foreground">{profile.tokens}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Tokens
          </p>
        </div>

        <div
          className="bg-card p-6 rounded-[2.5rem] border border-border shadow-xs text-center"
          data-ocid="profile.smiles.card"
        >
          <div className="w-10 h-10 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Smile size={18} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {profile.totalSmiles}
          </p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Smiles
          </p>
        </div>
      </div>

      {/* Achievement Badges */}
      <div
        className="bg-card px-6 py-6 rounded-[2rem] border border-border shadow-xs"
        data-ocid="profile.badges.section"
      >
        <div className="flex items-center gap-2 mb-5">
          <span className="text-base">🏅</span>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Achievement Badges
          </p>
        </div>

        {badges.length === 0 ? (
          <div
            className="text-center py-6"
            data-ocid="profile.badges.empty_state"
          >
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-sm font-bold text-foreground mb-1">
              No badges yet pookie!
            </p>
            <p className="text-[11px] text-muted-foreground font-bold leading-relaxed max-w-[220px] mx-auto">
              Post smiles to earn badges ✨
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <BadgeHint
                icon="🔥"
                label="3-day streak"
                desc="Post 3 days in a row"
              />
              <BadgeHint
                icon="⚡"
                label="100 tokens"
                desc="Earn 100 Smile Tokens"
              />
              <BadgeHint
                icon="🌟"
                label="7-day streak"
                desc="Post 7 days in a row"
              />
            </div>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 gap-3"
            data-ocid="profile.badges.list"
          >
            {badges.map((badge, i) => (
              <BadgeCard key={badge.id} badge={badge} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Referral Rewards */}
      <ReferralCard profile={profile} />

      {/* Email */}
      <div
        className="bg-card px-6 py-5 rounded-[2rem] border border-border flex items-center gap-4 shadow-xs"
        data-ocid="profile.email.card"
      >
        <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
          <Mail size={16} className="text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Email
          </p>
          <p className="text-sm font-bold text-foreground truncate mt-0.5">
            {profile.email}
          </p>
        </div>
      </div>

      {/* Unlocked stickers */}
      {profile.unlockedStickers.length > 0 && (
        <div
          className="bg-card px-6 py-5 rounded-[2rem] border border-border shadow-xs"
          data-ocid="profile.stickers.card"
        >
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            My Stickers ✨
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.unlockedStickers.map((sid) => (
              <span
                key={sid}
                className="text-2xl animate-bounce-gentle"
                title={sid}
              >
                {getEmojiForSticker(sid)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        type="button"
        onClick={onLogout}
        className="w-full py-5 bg-rose-50 text-rose-500 rounded-[2rem] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-smooth border border-rose-100 hover:bg-rose-100"
        data-ocid="profile.logout_button"
      >
        <LogOut size={18} />
        Exit Session
      </button>

      {/* Branding footer */}
      <p className="text-center text-[10px] font-bold text-muted-foreground/60 pb-2">
        Smilify® — Made with 💖 by The Three Musketeers
      </p>
    </div>
  );
}

// ── Referral Card ─────────────────────────────────────────────────────────────
function ReferralCard({ profile }: { profile: UserProfile }) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const referralCode = profile.referralCode ?? "";
  const referralCount = profile.referralCount ?? 0;
  const tokensEarned = referralCount * 50;

  const copyCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      alert(`Could not copy code — please copy manually: ${referralCode}`);
    }
  };

  const shareLink = async () => {
    if (!referralCode) return;
    const shareUrl = `${window.location.origin}?ref=${encodeURIComponent(referralCode)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Clipboard denied — try native share sheet if available
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ url: shareUrl });
        } catch {
          // User cancelled native share — no action needed
        }
      } else {
        alert(`Could not copy link — please copy manually: ${shareUrl}`);
      }
    }
  };

  return (
    <div
      className="bg-card px-6 py-5 rounded-[2rem] border border-border shadow-xs"
      data-ocid="profile.referral.card"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">🎁</span>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Referral Rewards
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted/50 rounded-xl px-4 py-3 text-center border border-border">
          <p className="text-xl font-bold text-foreground">{referralCount}</p>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
            Referrals
          </p>
        </div>
        <div className="bg-primary/10 rounded-xl px-4 py-3 text-center border border-primary/20">
          <p className="text-xl font-bold text-primary">{tokensEarned}</p>
          <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest mt-0.5">
            Tokens Earned
          </p>
        </div>
      </div>

      {/* Referral code */}
      <div className="mb-3">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
          Your Referral Code
        </p>
        <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-4 py-2.5 border border-border">
          <code className="flex-1 text-[12px] font-black text-primary tracking-widest">
            {referralCode || "—"}
          </code>
          <button
            type="button"
            onClick={copyCode}
            disabled={!referralCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider transition-smooth active:scale-90 disabled:opacity-40"
            data-ocid="profile.referral.copy_code_button"
            aria-label="Copy referral code"
          >
            <Copy size={11} />
            {codeCopied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Share link button */}
      <button
        type="button"
        onClick={shareLink}
        disabled={!referralCode}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-pink-rose text-primary-foreground font-bold text-[11px] uppercase tracking-widest shadow-pookie active:scale-95 transition-smooth disabled:opacity-40"
        data-ocid="profile.referral.share_link_button"
      >
        <Share2 size={14} />
        {linkCopied ? "Link Copied! 🎀" : "Share Invite Link"}
      </button>
    </div>
  );
}

// ── Badge Card ─────────────────────────────────────────────────────────────
function BadgeCard({ badge, index }: { badge: Badge; index: number }) {
  const earnedDate = new Date(Number(badge.earnedAt / 1_000_000n));
  const dateStr = earnedDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="bg-gradient-to-br from-primary/5 to-accent/10 border border-primary/20 rounded-[1.5rem] p-4 flex flex-col items-center text-center shadow-xs fade-in zoom-in"
      style={{ animationDelay: `${index * 0.07}s` }}
      data-ocid={`profile.badge.item.${index + 1}`}
    >
      <span className="text-3xl mb-2 animate-bounce-gentle">{badge.icon}</span>
      <p className="text-[11px] font-black text-foreground leading-tight mb-1">
        {badge.name}
      </p>
      <p className="text-[9px] text-muted-foreground font-bold leading-snug mb-2">
        {badge.description}
      </p>
      <span className="text-[8px] font-bold text-primary/60 uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full">
        {dateStr}
      </span>
    </div>
  );
}

// ── Badge Hint (empty state) ───────────────────────────────────────────────
function BadgeHint({
  icon,
  label,
  desc,
}: {
  icon: string;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/50 rounded-xl border border-border">
      <span className="text-lg flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-foreground">{label}</p>
        <p className="text-[9px] text-muted-foreground font-bold truncate">
          {desc}
        </p>
      </div>
    </div>
  );
}

// Map sticker id to emoji for display
const STICKER_EMOJI: Record<string, string> = {
  halo: "✨",
  shades: "🕶️",
  ribbon: "🎀",
  crown: "👑",
  sun: "☀️",
  flower: "🌸",
  unicorn: "🦄",
  butterfly: "🦋",
  love: "💝",
  fire: "🔥",
  diamond: "💎",
};

function getEmojiForSticker(id: string): string {
  return STICKER_EMOJI[id] ?? "✨";
}
