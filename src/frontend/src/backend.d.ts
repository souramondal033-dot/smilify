import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    userName: string;
    userId: string;
    createdAt: bigint;
    rank: bigint;
    likes: bigint;
    userCountry: string;
    imageBlobId: string;
    smileId: string;
}
export type Result_2 = {
    __kind__: "ok";
    ok: Donation;
} | {
    __kind__: "err";
    err: string;
};
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SmileInput {
    userState?: string;
    inviteCode?: string;
    userRegion?: string;
    imageBlobId: string;
}
export type Result_6 = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: string;
};
export interface TopDonor {
    donorName: string;
    rank: bigint;
    totalAmount: string;
    donorPrincipal: string;
    donationCount: bigint;
}
export type Result_5 = {
    __kind__: "ok";
    ok: {
        shares: bigint;
        views: bigint;
        likes: bigint;
    };
} | {
    __kind__: "err";
    err: string;
};
export type Result_1 = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Result_4 = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: string;
};
export interface Badge {
    id: BadgeId;
    icon: string;
    name: string;
    description: string;
    earnedAt: bigint;
}
export interface Donation {
    id: string;
    paymentMethod: string;
    createdAt: bigint;
    donorName: string;
    message?: string;
    donorPrincipal: string;
    amount: string;
}
export type Result = {
    __kind__: "ok";
    ok: UserProfile;
} | {
    __kind__: "err";
    err: string;
};
export interface UpdateProfileInput {
    bio?: string;
    name?: string;
    email?: string;
    isPublic?: boolean;
    phone?: string;
    location?: string;
}
export type Result_3 = {
    __kind__: "ok";
    ok: Smile;
} | {
    __kind__: "err";
    err: string;
};
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface UserSummary {
    id: Principal;
    country: string;
    name: string;
    totalSmiles: bigint;
}
export interface RegisterInput {
    country: string;
    name: string;
    email: string;
}
export type Result_7 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface Smile {
    id: string;
    profilePicUrl?: string;
    userName: string;
    shares: bigint;
    userState?: string;
    views: bigint;
    userId: Principal;
    createdAt: bigint;
    likedBy: Array<Principal>;
    likes: bigint;
    inviteCode?: string;
    userCountry: string;
    userRegion?: string;
    imageBlobId: string;
}
export interface LikeNotification {
    id: string;
    likerName: string;
    read: boolean;
    likerId: Principal;
    timestamp: bigint;
    smileOwnerId: Principal;
    smileId: string;
}
export interface ChatMessage {
    content: string;
    role: string;
}
export interface AdminStats {
    totalUsers: bigint;
    totalDonations: bigint;
    totalSmiles: bigint;
}
export interface UserProfile {
    id: Principal;
    bio?: string;
    profilePicUrl?: string;
    lastLoginTime: bigint;
    referralCode: string;
    country: string;
    name: string;
    badges: Array<Badge>;
    joinedAt: bigint;
    lastPostDate: bigint;
    referralCount: bigint;
    deactivatedAt?: bigint;
    email: string;
    referredBy?: string;
    tokens: bigint;
    unlockedStickers: Array<string>;
    isPublic: boolean;
    phone?: string;
    totalSmiles: bigint;
    location?: string;
    currentStreak: bigint;
}
export enum BadgeId {
    TOKENS_100 = "TOKENS_100",
    TOKENS_500 = "TOKENS_500",
    TOKENS_1000 = "TOKENS_1000",
    STREAK_30 = "STREAK_30",
    STREAK_3 = "STREAK_3",
    STREAK_7 = "STREAK_7"
}
export interface backendInterface {
    bulkDeleteSmiles(ids: Array<string>): Promise<Result_4>;
    buySticker(stickerId: string, cost: bigint): Promise<Result>;
    chatWithPookie(message: string, history: Array<ChatMessage>): Promise<Result_1>;
    deactivateAccount(): Promise<Result_1>;
    deleteAccount(): Promise<Result_1>;
    deleteSmile(smileId: string): Promise<Result_7>;
    getAdminStats(): Promise<AdminStats>;
    getAllUsers(): Promise<Array<UserSummary>>;
    getCookieConsent(): Promise<boolean>;
    getDonations(): Promise<Array<Donation>>;
    getLastLoginTime(): Promise<Result_6>;
    getMonthlyLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getMyProfile(): Promise<UserProfile | null>;
    getMySmiles(): Promise<Array<Smile>>;
    getNotifications(): Promise<Array<LikeNotification>>;
    getReferralCode(): Promise<Result_1>;
    getSmileAnalytics(smileId: string): Promise<Result_5>;
    getSmileByInvite(code: string): Promise<Result_3>;
    getSmiles(): Promise<Array<Smile>>;
    getTopDonors(): Promise<Array<TopDonor>>;
    getTrendingSmiles(): Promise<Array<Smile>>;
    getWeeklyLeaderboard(): Promise<Array<LeaderboardEntry>>;
    likeSmile(smileId: string): Promise<Result_4>;
    markAllNotificationsRead(): Promise<void>;
    postSmile(input: SmileInput): Promise<Result_3>;
    reactivateAccount(): Promise<Result_1>;
    recordDonation(donorName: string, amount: string, paymentMethod: string, message: string | null): Promise<Result_2>;
    recordReferral(code: string): Promise<Result_1>;
    recordSmileShare(smileId: string): Promise<void>;
    recordSmileView(smileId: string): Promise<void>;
    registerUser(input: RegisterInput): Promise<Result>;
    setCookieConsent(): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateLastLoginTime(): Promise<void>;
    updateProfile(input: UpdateProfileInput): Promise<Result>;
    updateProfilePicture(blobId: string, picUrl: string): Promise<Result>;
}
