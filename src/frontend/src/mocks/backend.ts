import type { backendInterface } from "../backend";

const mockPrincipal = {
  toText: () => "aaaaa-aa",
  toString: () => "aaaaa-aa",
} as unknown as import("@icp-sdk/core/principal").Principal;

const mockUserProfile = {
  id: mockPrincipal,
  country: "India 🇮🇳",
  name: "Pookie User",
  joinedAt: BigInt(Date.now()),
  lastPostDate: BigInt(0),
  lastLoginTime: BigInt(0),
  email: "pookie@example.com",
  tokens: BigInt(100),
  unlockedStickers: ["halo", "ribbon"],
  totalSmiles: BigInt(3),
  badges: [] as import("../backend").Badge[],
  currentStreak: BigInt(0),
  referralCode: "POOKIE123",
  referralCount: BigInt(0),
  isPublic: true,
};

export const mockBackend: backendInterface = {
  buySticker: async (_stickerId: string, _cost: bigint) => ({
    __kind__: "ok" as const,
    ok: { ...mockUserProfile, tokens: BigInt(60) },
  }),

  chatWithPookie: async (_message: string, _history) => ({
    __kind__: "ok" as const,
    ok: "Hi pookie! I'm Pookie Panda 🐼 Ready to spread some smiles? ✨",
  }),

  deleteSmile: async (_smileId: string) => ({
    __kind__: "ok" as const,
    ok: null,
  }),

  getAdminStats: async () => ({
    totalUsers: BigInt(42),
    totalSmiles: BigInt(128),
    totalDonations: BigInt(0),
  }),

  getAllUsers: async () => [
    {
      id: mockPrincipal,
      country: "India 🇮🇳",
      name: "Souradipta Mondal",
      totalSmiles: BigInt(12),
    },
    {
      id: mockPrincipal,
      country: "India 🇮🇳",
      name: "Souvik Das",
      totalSmiles: BigInt(8),
    },
  ],

  getMyProfile: async () => null,

  getSmiles: async () => [
    {
      id: "smile-1",
      userName: "Pookie Star",
      userId: mockPrincipal,
      createdAt: BigInt(Date.now() - 60000),
      likes: BigInt(7),
      likedBy: [] as import("@icp-sdk/core/principal").Principal[],
      userCountry: "India 🇮🇳",
      imageBlobId: "blob-1",
      views: BigInt(42),
      shares: BigInt(5),
      inviteCode: undefined,
      profilePicUrl: undefined,
    },
    {
      id: "smile-2",
      userName: "Happy Soul",
      userId: mockPrincipal,
      createdAt: BigInt(Date.now() - 120000),
      likes: BigInt(3),
      likedBy: [] as import("@icp-sdk/core/principal").Principal[],
      userCountry: "Japan 🇯🇵",
      imageBlobId: "blob-2",
      views: BigInt(18),
      shares: BigInt(2),
      inviteCode: undefined,
      profilePicUrl: undefined,
    },
  ],

  likeSmile: async (_smileId: string) => ({
    __kind__: "ok" as const,
    ok: BigInt(8),
  }),

  postSmile: async (_input) => ({
    __kind__: "ok" as const,
    ok: {
      id: "smile-new",
      userName: "Pookie User",
      userId: mockPrincipal,
      createdAt: BigInt(Date.now()),
      likes: BigInt(0),
      likedBy: [] as import("@icp-sdk/core/principal").Principal[],
      userCountry: "India 🇮🇳",
      imageBlobId: "blob-new",
      views: BigInt(0),
      shares: BigInt(0),
      inviteCode: undefined,
      profilePicUrl: undefined,
    },
  }),

  registerUser: async (_input) => ({
    __kind__: "ok" as const,
    ok: {
      ...mockUserProfile,
      name: "New Pookie",
      email: "new@example.com",
      tokens: BigInt(100),
      unlockedStickers: ["halo"],
      totalSmiles: BigInt(0),
    },
  }),

  getCookieConsent: async () => false,

  getSmileByInvite: async (_code: string) => ({
    __kind__: "err" as const,
    err: "Not found",
  }),

  getWeeklyLeaderboard: async () => [],

  getMonthlyLeaderboard: async () => [],

  getLastLoginTime: async () => ({
    __kind__: "ok" as const,
    ok: BigInt(0),
  }),

  getReferralCode: async () => ({
    __kind__: "ok" as const,
    ok: "POOKIE123",
  }),

  recordReferral: async (_code: string) => ({
    __kind__: "ok" as const,
    ok: "Referral recorded!",
  }),

  getDonations: async () => [],

  getTopDonors: async () => [],

  recordDonation: async (_donorName, _amount, _paymentMethod, _message) => ({
    __kind__: "ok" as const,
    ok: {
      id: "donation-1",
      donorName: _donorName,
      amount: _amount,
      paymentMethod: _paymentMethod,
      donorPrincipal: "aaaaa-aa",
      createdAt: BigInt(Date.now()),
    },
  }),

  setCookieConsent: async () => undefined,

  updateLastLoginTime: async () => undefined,

  // New account management methods
  bulkDeleteSmiles: async (_ids: string[]) => ({
    __kind__: "ok" as const,
    ok: BigInt(_ids.length),
  }),

  deactivateAccount: async () => ({
    __kind__: "ok" as const,
    ok: "Account deactivated",
  }),

  reactivateAccount: async () => ({
    __kind__: "ok" as const,
    ok: "Account reactivated",
  }),

  deleteAccount: async () => ({
    __kind__: "ok" as const,
    ok: "Account deleted",
  }),

  getMySmiles: async () => [
    {
      id: "smile-1",
      userName: "Pookie User",
      userId: mockPrincipal,
      createdAt: BigInt(Date.now() - 60000),
      likes: BigInt(7),
      likedBy: [] as import("@icp-sdk/core/principal").Principal[],
      userCountry: "India 🇮🇳",
      imageBlobId: "blob-1",
      views: BigInt(42),
      shares: BigInt(5),
      inviteCode: undefined,
      profilePicUrl: undefined,
    },
  ],

  getTrendingSmiles: async () => [
    {
      id: "smile-1",
      userName: "Pookie Star",
      userId: mockPrincipal,
      createdAt: BigInt(Date.now() - 60000),
      likes: BigInt(15),
      likedBy: [] as import("@icp-sdk/core/principal").Principal[],
      userCountry: "India 🇮🇳",
      imageBlobId: "blob-1",
      views: BigInt(100),
      shares: BigInt(20),
      inviteCode: undefined,
      profilePicUrl: undefined,
    },
  ],

  recordSmileView: async (_smileId: string) => undefined,

  recordSmileShare: async (_smileId: string) => undefined,

  getSmileAnalytics: async (_smileId: string) => ({
    __kind__: "ok" as const,
    ok: { views: BigInt(42), likes: BigInt(7), shares: BigInt(5) },
  }),

  updateProfile: async (_input) => ({
    __kind__: "ok" as const,
    ok: { ...mockUserProfile },
  }),

  updateProfilePicture: async (_blobId: string, _picUrl: string) => ({
    __kind__: "ok" as const,
    ok: { ...mockUserProfile, profilePicUrl: _picUrl },
  }),

  transform: async (input) => ({
    status: BigInt(200),
    body: input.response.body,
    headers: input.response.headers,
  }),

  getNotifications: async () => [],

  markAllNotificationsRead: async () => undefined,
};
