export type View =
  | "home"
  | "wall"
  | "camera"
  | "editor"
  | "shop"
  | "info"
  | "me"
  | "admin"
  | "terms"
  | "privacy"
  | "signin"
  | "signup"
  | "leaderboard"
  | "welfare"
  | "account-settings"
  | "content-hub";

export type BadgeId =
  | "STREAK_3"
  | "STREAK_7"
  | "STREAK_30"
  | "TOKENS_100"
  | "TOKENS_500"
  | "TOKENS_1000";

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  earnedAt: bigint;
}

export interface UserProfile {
  name: string;
  email: string;
  country: string;
  tokens: number;
  totalSmiles: number;
  unlockedStickers: string[];
  uid: string;
  joinedAt?: { seconds: number };
  badges?: Badge[];
  lastPostDate?: bigint;
  currentStreak?: bigint;
  lastLoginTime?: bigint;
  // extended account management fields
  profilePicUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  isPublic?: boolean;
  deactivatedAt?: bigint | null;
  // referral fields
  referralCode?: string;
  referralCount?: number;
}

export interface Smile {
  id: string;
  userId: string;
  userName: string;
  image: string;
  likes: number;
  createdAt?: { seconds: number };
  country: string;
  inviteCode?: [] | [string];
  // analytics + profile pic
  views?: number;
  shares?: number;
  profilePicUrl?: string | null;
  // location fields
  region?: string;
  state?: string;
}

export interface LeaderboardEntry {
  rank: number;
  smileId: string;
  userId: string;
  userName: string;
  userCountry: string;
  imageBlobId: string;
  likes: number;
  createdAt: number;
}

export interface AdminStats {
  totalUsers: number;
  totalSmiles: number;
}

export interface UserSummary {
  id: string;
  name: string;
  country: string;
  totalSmiles: number;
  uid: string;
}

export interface StickerDef {
  id: string;
  emoji: string;
  label: string;
  cost: number;
}

export interface PlacedSticker {
  id: number;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}
