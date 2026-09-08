import List "mo:core/List";

module {
  // ── Badge ─────────────────────────────────────────────────────────────────
  public type BadgeId = {
    #STREAK_3;
    #STREAK_7;
    #STREAK_30;
    #TOKENS_100;
    #TOKENS_500;
    #TOKENS_1000;
  };

  public type Badge = {
    id          : BadgeId;
    name        : Text;
    description : Text;
    icon        : Text;   // emoji
    earnedAt    : Int;    // Timestamp (nanoseconds)
  };

  // ── User ──────────────────────────────────────────────────────────────────
  public type UserProfile = {
    id               : Principal;
    name             : Text;
    email            : Text;
    country          : Text;
    tokens           : Nat;
    unlockedStickers : [Text];
    joinedAt         : Int;
    totalSmiles      : Nat;
    lastPostDate     : Nat;    // days since Unix epoch (0 = never posted)
    currentStreak    : Nat;    // consecutive posting days
    badges           : [Badge];
    // Referral tracking
    referralCode     : Text;   // unique code generated at registration
    referredBy       : ?Text;  // referral code of the person who invited this user
    referralCount    : Int;    // number of users this user has referred
    // Re-engagement
    lastLoginTime    : Int;    // nanosecond timestamp, 0 = never tracked
    // Account management (new)
    profilePicUrl    : ?Text;  // URL resolved from profile picture blob
    bio              : ?Text;
    phone            : ?Text;
    location         : ?Text;
    isPublic         : Bool;   // profile visibility, default true
    deactivatedAt    : ?Int;   // nanosecond timestamp when deactivated, null = active
  };

  public type RegisterInput = {
    name    : Text;
    email   : Text;
    country : Text;
  };

  public type UpdateProfileInput = {
    name     : ?Text;
    email    : ?Text;
    bio      : ?Text;
    phone    : ?Text;
    location : ?Text;
    isPublic : ?Bool;
  };

  // ── Smile ─────────────────────────────────────────────────────────────────
  public type Smile = {
    id            : Text;
    userId        : Principal;  // authorPrincipal
    userName      : Text;       // authorName
    userCountry   : Text;
    userRegion    : ?Text;      // optional region/state provided at post time
    userState     : ?Text;      // optional state/province provided at post time
    imageBlobId   : Text;
    likes         : Nat;
    likedBy       : [Principal]; // tracks who liked to avoid duplicates
    createdAt     : Int;
    inviteCode    : ?Text;      // optional shareable invite code
    // Analytics
    views         : Nat;
    shares        : Nat;
    profilePicUrl : ?Text;      // denormalised profile pic at post time
  };

  public type SmileInput = {
    imageBlobId : Text;
    inviteCode  : ?Text;
    userRegion  : ?Text;  // optional region from browser geolocation
    userState   : ?Text;  // optional state/province from browser geolocation
  };

  // ── Notifications ──────────────────────────────────────────────────────────
  // Internal mutable type (used in storage)
  public type LikeNotificationInternal = {
    id           : Text;
    smileId      : Text;
    smileOwnerId : Principal;
    likerName    : Text;
    likerId      : Principal;
    timestamp    : Int;
    var read     : Bool;
  };

  // Shared (immutable) type for public API boundary
  public type LikeNotification = {
    id           : Text;
    smileId      : Text;
    smileOwnerId : Principal;
    likerName    : Text;
    likerId      : Principal;
    timestamp    : Int;
    read         : Bool;
  };

  // ── Leaderboard ───────────────────────────────────────────────────────────
  public type LeaderboardEntry = {
    rank        : Nat;
    smileId     : Text;
    userId      : Text;
    userName    : Text;
    userCountry : Text;
    imageBlobId : Text;
    likes       : Nat;
    createdAt   : Int;
  };

  // ── Donation ──────────────────────────────────────────────────────────────
  public type Donation = {
    id            : Text;
    donorName     : Text;
    donorPrincipal: Text;
    amount        : Text;
    paymentMethod : Text;
    message       : ?Text;
    createdAt     : Int;
  };

  public type TopDonor = {
    rank          : Nat;
    donorName     : Text;
    donorPrincipal: Text;
    totalAmount   : Text;  // sum label e.g. "5 donations"
    donationCount : Nat;
  };

  // ── Admin ─────────────────────────────────────────────────────────────────
  public type AdminStats = {
    totalUsers     : Nat;
    totalSmiles    : Nat;
    totalDonations : Nat;
  };

  public type UserSummary = {
    id          : Principal;
    name        : Text;
    country     : Text;
    totalSmiles : Nat;
  };
};
