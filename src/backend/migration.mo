import List "mo:core/List";
import Map  "mo:core/Map";

module {
  // ── Old types (inline from previous version) ─────────────────────────────
  type OldBadgeId = {
    #STREAK_3;
    #STREAK_7;
    #STREAK_30;
    #TOKENS_100;
    #TOKENS_500;
    #TOKENS_1000;
  };

  type OldBadge = {
    id          : OldBadgeId;
    name        : Text;
    description : Text;
    icon        : Text;
    earnedAt    : Int;
  };

  type OldUserProfile = {
    id               : Principal;
    name             : Text;
    email            : Text;
    country          : Text;
    tokens           : Nat;
    unlockedStickers : [Text];
    joinedAt         : Int;
    totalSmiles      : Nat;
    lastPostDate     : Nat;
    currentStreak    : Nat;
    badges           : [OldBadge];
    referralCode     : Text;
    referredBy       : ?Text;
    referralCount    : Int;
    lastLoginTime    : Int;
    profilePicUrl    : ?Text;
    bio              : ?Text;
    phone            : ?Text;
    location         : ?Text;
    isPublic         : Bool;
    deactivatedAt    : ?Int;
  };

  type OldSmile = {
    id            : Text;
    userId        : Principal;
    userName      : Text;
    userCountry   : Text;
    imageBlobId   : Text;
    likes         : Nat;
    likedBy       : [Principal];
    createdAt     : Int;
    inviteCode    : ?Text;
    views         : Nat;
    shares        : Nat;
    profilePicUrl : ?Text;
  };

  type OldLikeNotificationInternal = {
    id           : Text;
    smileId      : Text;
    smileOwnerId : Principal;
    likerName    : Text;
    likerId      : Principal;
    timestamp    : Int;
    var read     : Bool;
  };

  type OldDonation = {
    id            : Text;
    donorName     : Text;
    donorPrincipal: Text;
    amount        : Text;
    paymentMethod : Text;
    message       : ?Text;
    createdAt     : Int;
  };

  // ── New types (mirrors current types/smilify-core.mo) ────────────────────
  type NewBadgeId = {
    #STREAK_3;
    #STREAK_7;
    #STREAK_30;
    #TOKENS_100;
    #TOKENS_500;
    #TOKENS_1000;
  };

  type NewBadge = {
    id          : NewBadgeId;
    name        : Text;
    description : Text;
    icon        : Text;
    earnedAt    : Int;
  };

  type NewUserProfile = {
    id               : Principal;
    name             : Text;
    email            : Text;
    country          : Text;
    tokens           : Nat;
    unlockedStickers : [Text];
    joinedAt         : Int;
    totalSmiles      : Nat;
    lastPostDate     : Nat;
    currentStreak    : Nat;
    badges           : [NewBadge];
    referralCode     : Text;
    referredBy       : ?Text;
    referralCount    : Int;
    lastLoginTime    : Int;
    profilePicUrl    : ?Text;
    bio              : ?Text;
    phone            : ?Text;
    location         : ?Text;
    isPublic         : Bool;
    deactivatedAt    : ?Int;
  };

  type NewSmile = {
    id            : Text;
    userId        : Principal;
    userName      : Text;
    userCountry   : Text;
    userRegion    : ?Text;
    userState     : ?Text;
    imageBlobId   : Text;
    likes         : Nat;
    likedBy       : [Principal];
    createdAt     : Int;
    inviteCode    : ?Text;
    views         : Nat;
    shares        : Nat;
    profilePicUrl : ?Text;
  };

  type OldLikeNotificationInternalAlias = OldLikeNotificationInternal;

  type NewLikeNotificationInternal = {
    id           : Text;
    smileId      : Text;
    smileOwnerId : Principal;
    likerName    : Text;
    likerId      : Principal;
    timestamp    : Int;
    var read     : Bool;
  };

  type NewDonation = {
    id            : Text;
    donorName     : Text;
    donorPrincipal: Text;
    amount        : Text;
    paymentMethod : Text;
    message       : ?Text;
    createdAt     : Int;
  };

  // ── Actor state shapes ───────────────────────────────────────────────────
  type OldActor = {
    users         : Map.Map<Principal, OldUserProfile>;
    smiles        : List.List<OldSmile>;
    cookieConsent : Map.Map<Principal, Bool>;
    donations     : List.List<OldDonation>;
    notifications : Map.Map<Principal, List.List<OldLikeNotificationInternal>>;
  };

  type NewActor = {
    users         : Map.Map<Principal, NewUserProfile>;
    smiles        : List.List<NewSmile>;
    cookieConsent : Map.Map<Principal, Bool>;
    donations     : List.List<NewDonation>;
    notifications : Map.Map<Principal, List.List<NewLikeNotificationInternal>>;
  };

  // ── Migration function ───────────────────────────────────────────────────
  public func run(old : OldActor) : NewActor {
    let smiles = old.smiles.map<OldSmile, NewSmile>(
      func(s) {
        {
          s with
          userRegion = null : ?Text;
          userState  = null : ?Text;
        }
      }
    );
    {
      users         = old.users;
      smiles;
      cookieConsent = old.cookieConsent;
      donations     = old.donations;
      notifications = old.notifications;
    };
  };
};
