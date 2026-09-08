import Map       "mo:core/Map";
import List      "mo:core/List";
import Array     "mo:core/Array";
import Time      "mo:core/Time";
import Text      "mo:core/Text";
import Principal "mo:core/Principal";
import Int       "mo:core/Int";
import Types     "../types/smilify-core";
import Common    "../types/common";
import Debug "mo:core/Debug";

module {
  // Storage type aliases used by callers
  public type Users         = Map.Map<Principal, Types.UserProfile>;
  public type Smiles        = List.List<Types.Smile>;
  public type CookieConsent = Map.Map<Principal, Bool>;
  public type Donations     = List.List<Types.Donation>;
  public type Notifications = Map.Map<Principal, List.List<Types.LikeNotificationInternal>>;

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Days since Unix epoch from nanosecond timestamp
  func toDays(ns : Int) : Nat {
    (ns / 86_400_000_000_000).toNat();
  };

  func hasBadge(badges : [Types.Badge], id : Types.BadgeId) : Bool {
    badges.find<Types.Badge>(func(b : Types.Badge) : Bool { b.id == id }) != null;
  };

  func badgeFor(id : Types.BadgeId, now : Int) : Types.Badge {
    let (name, description, icon) = switch id {
      case (#STREAK_3)    ("3-Day Streak",    "Post 3 days in a row",      "🔥");
      case (#STREAK_7)    ("7-Day Streak",    "Post 7 days in a row",      "⚡");
      case (#STREAK_30)   ("30-Day Streak",   "Post 30 days in a row",     "💎");
      case (#TOKENS_100)  ("Token Novice",    "Earn 100 Smile Tokens",     "🌸");
      case (#TOKENS_500)  ("Token Expert",    "Earn 500 Smile Tokens",     "🌺");
      case (#TOKENS_1000) ("Token Master",    "Earn 1000 Smile Tokens",    "👑");
    };
    { id; name; description; icon; earnedAt = now };
  };

  // Check all badge conditions and return any newly earned badges
  func checkBadges(profile : Types.UserProfile, now : Int) : [Types.Badge] {
    var newBadges : [Types.Badge] = [];

    // Streak badges
    if (profile.currentStreak >= 3 and not hasBadge(profile.badges, #STREAK_3)) {
      newBadges := newBadges.concat([badgeFor(#STREAK_3, now)]);
    };
    if (profile.currentStreak >= 7 and not hasBadge(profile.badges, #STREAK_7)) {
      newBadges := newBadges.concat([badgeFor(#STREAK_7, now)]);
    };
    if (profile.currentStreak >= 30 and not hasBadge(profile.badges, #STREAK_30)) {
      newBadges := newBadges.concat([badgeFor(#STREAK_30, now)]);
    };

    // Token badges
    if (profile.tokens >= 100 and not hasBadge(profile.badges, #TOKENS_100)) {
      newBadges := newBadges.concat([badgeFor(#TOKENS_100, now)]);
    };
    if (profile.tokens >= 500 and not hasBadge(profile.badges, #TOKENS_500)) {
      newBadges := newBadges.concat([badgeFor(#TOKENS_500, now)]);
    };
    if (profile.tokens >= 1000 and not hasBadge(profile.badges, #TOKENS_1000)) {
      newBadges := newBadges.concat([badgeFor(#TOKENS_1000, now)]);
    };

    newBadges;
  };

  // Generate a referral code from a principal — first 8 chars of the text repr
  func makeReferralCode(caller : Principal) : Text {
    let raw   = caller.toText();
    let chars = raw.toArray();
    let len   = if (chars.size() < 8) chars.size() else 8;
    Text.fromArray(Array.tabulate(len, func(i : Nat) : Char { chars[i] }));
  };

  // ── User operations ───────────────────────────────────────────────────────

  public func registerUser(
    users  : Users,
    caller : Principal,
    input  : Types.RegisterInput,
  ) : Common.Result<Types.UserProfile, Text> {
    if (caller.isAnonymous()) {
      return #err("You must be logged in to register.");
    };
    switch (users.get(caller)) {
      case (?existing) { return #ok(existing) };
      case null {};
    };
    let profile : Types.UserProfile = {
      id               = caller;
      name             = input.name;
      email            = input.email;
      country          = input.country;
      tokens           = 100;
      unlockedStickers = ["halo"];
      joinedAt         = Time.now();
      totalSmiles      = 0;
      lastPostDate     = 0;
      currentStreak    = 0;
      badges           = [];
      referralCode     = makeReferralCode(caller);
      referredBy       = null;
      referralCount    = 0;
      lastLoginTime    = 0;
      profilePicUrl    = null;
      bio              = null;
      phone            = null;
      location         = null;
      isPublic         = true;
      deactivatedAt    = null;
    };
    users.add(caller, profile);
    #ok(profile);
  };

  public func getProfile(
    users  : Users,
    caller : Principal,
  ) : ?Types.UserProfile {
    users.get(caller);
  };

  public func buySticker(
    users     : Users,
    caller    : Principal,
    stickerId : Text,
    cost      : Nat,
  ) : Common.Result<Types.UserProfile, Text> {
    switch (users.get(caller)) {
      case null { #err("User not found") };
      case (?profile) {
        if (profile.tokens < cost) {
          return #err("Insufficient tokens");
        };
        let alreadyOwned = profile.unlockedStickers.find<Text>(
          func(s : Text) : Bool { s == stickerId }
        ) != null;
        if (alreadyOwned) {
          return #err("Sticker already unlocked");
        };
        let updated : Types.UserProfile = {
          profile with
          tokens           = profile.tokens - cost;
          unlockedStickers = profile.unlockedStickers.concat([stickerId]);
        };
        users.add(caller, updated);
        #ok(updated);
      };
    };
  };

  // ── Referral operations ───────────────────────────────────────────────────

  public func getReferralCode(
    users  : Users,
    caller : Principal,
  ) : Common.Result<Text, Text> {
    switch (users.get(caller)) {
      case null    { #err("User not found") };
      case (?prof) { #ok(prof.referralCode) };
    };
  };

  /// Record a referral: the caller used someone's code.
  /// Finds the referrer by their referralCode, grants them +50 tokens, increments their referralCount,
  /// and stores the code on the caller's profile.
  public func recordReferral(
    users  : Users,
    caller : Principal,
    code   : Text,
  ) : Common.Result<Text, Text> {
    // Caller must be registered
    switch (users.get(caller)) {
      case null { return #err("You must register first") };
      case (?callerProfile) {
        // Don't apply your own code
        if (callerProfile.referralCode == code) {
          return #err("You cannot use your own referral code");
        };
        // Already used a referral
        if (callerProfile.referredBy != null) {
          return #err("You have already used a referral code");
        };
        // Find the referrer
        var referrerPrincipal : ?Principal = null;
        for ((pid, prof) in users.entries()) {
          if (prof.referralCode == code) {
            referrerPrincipal := ?pid;
          };
        };
        switch (referrerPrincipal) {
          case null { #err("Referral code not found") };
          case (?refPid) {
            switch (users.get(refPid)) {
              case null { #err("Referrer not found") };
              case (?refProf) {
                // Reward referrer
                let updatedRef : Types.UserProfile = {
                  refProf with
                  tokens        = refProf.tokens + 50;
                  referralCount = refProf.referralCount + 1;
                };
                users.add(refPid, updatedRef);
                // Mark caller as referred
                let updatedCaller : Types.UserProfile = {
                  callerProfile with
                  referredBy = ?code;
                };
                users.add(caller, updatedCaller);
                #ok("Referral recorded! " # refProf.name # " earned 50 tokens.");
              };
            };
          };
        };
      };
    };
  };

  // ── Re-engagement ─────────────────────────────────────────────────────────

  public func getLastLoginTime(
    users  : Users,
    caller : Principal,
  ) : Common.Result<Int, Text> {
    switch (users.get(caller)) {
      case null    { #err("User not found") };
      case (?prof) { #ok(prof.lastLoginTime) };
    };
  };

  public func updateLastLoginTime(
    users  : Users,
    caller : Principal,
  ) : () {
    switch (users.get(caller)) {
      case null {};
      case (?prof) {
        users.add(caller, { prof with lastLoginTime = Time.now() });
      };
    };
  };

  // ── Smile operations ──────────────────────────────────────────────────────

  public func postSmile(
    smiles : Smiles,
    users  : Users,
    caller : Principal,
    input  : Types.SmileInput,
  ) : Common.Result<Types.Smile, Text> {
    Debug.print("[postSmile] caller=" # caller.toText() # " imageBlobId=" # input.imageBlobId);
    if (caller.isAnonymous()) {
      Debug.print("[postSmile] rejected: anonymous caller");
      return #err("You must be logged in to post a smile.");
    };
    switch (users.get(caller)) {
      case null {
        Debug.print("[postSmile] rejected: profile not found for " # caller.toText());
        #err("Profile not found. Please complete registration first.");
      };
      case (?profile) {
        let now     = Time.now();
        let today   = toDays(now);
        Debug.print("[postSmile] profile found: " # profile.name # " tokens=" # profile.tokens.toText());

        // ── Streak calculation ─────────────────────────────────────────
        let (newStreak, newLastPostDate) = if (profile.lastPostDate == 0) {
          (1, today);
        } else if (profile.lastPostDate == today) {
          (profile.currentStreak, today);
        } else if (profile.lastPostDate + 1 == today) {
          (profile.currentStreak + 1, today);
        } else {
          (1, today);
        };

        // ── Token reward ──────────────────────────────────────────────
        let TOKENS_PER_POST = 10;
        let newTokens       = profile.tokens + TOKENS_PER_POST;
        let newTotalSmiles  = profile.totalSmiles + 1;

        // ── Build updated profile (pre-badge-check) ───────────────────
        let updatedPreBadge : Types.UserProfile = {
          profile with
          tokens        = newTokens;
          totalSmiles   = newTotalSmiles;
          lastPostDate  = newLastPostDate;
          currentStreak = newStreak;
        };

        // ── Badge check ───────────────────────────────────────────────
        let newBadges = checkBadges(updatedPreBadge, now);
        let updatedProfile : Types.UserProfile = if (newBadges.size() > 0) {
          { updatedPreBadge with badges = updatedPreBadge.badges.concat(newBadges) };
        } else {
          updatedPreBadge;
        };
        users.add(caller, updatedProfile);

        // ── Invite code ───────────────────────────────────────────────
        let smileCount = smiles.size();
        let smileId    = caller.toText() # "-" # smileCount.toText();
        let inviteCode : ?Text = switch (input.inviteCode) {
          case (?code) { ?code };
          case null    {
            let raw    = smileId;
            let maxLen = if (raw.size() < 8) raw.size() else 8;
            let chars  = raw.toArray();
            let slice  = Array.tabulate(maxLen, func(i : Nat) : Char { chars[i] });
            ?Text.fromArray(slice);
          };
        };

        // ── Build and store smile ─────────────────────────────────────
        let smile : Types.Smile = {
          id             = smileId;
          userId         = caller;
          userName       = profile.name;
          userCountry    = profile.country;
          userRegion     = input.userRegion;
          userState      = input.userState;
          imageBlobId    = input.imageBlobId;
          likes          = 0;
          likedBy        = [];
          createdAt      = now;
          inviteCode;
          views          = 0;
          shares         = 0;
          profilePicUrl  = profile.profilePicUrl;
        };
        smiles.add(smile);
        Debug.print("[postSmile] smile created: " # smileId);
        #ok(smile);
      };
    };
  };

  public func getSmiles(
    smiles : Smiles,
  ) : [Types.Smile] {
    smiles.toArray();
  };

  public func likeSmile(
    smiles          : Smiles,
    notifications   : Notifications,
    smileId         : Text,
    callerPrincipal : Principal,
    likerName       : Text,
  ) : Common.Result<Nat, Text> {
    let pred = func(s : Types.Smile) : Bool { s.id == smileId };
    switch (smiles.findIndex<Types.Smile>(pred)) {
      case null { #err("Smile not found") };
      case (?idx) {
        let smile    = smiles.at(idx);
        // Prevent duplicate likes from same user
        let alreadyLiked = smile.likedBy.find<Principal>(func(p : Principal) : Bool { p == callerPrincipal }) != null;
        if (alreadyLiked) {
          return #err("Already liked");
        };
        let newLikes = smile.likes + 1;
        smiles.put(idx, { smile with likes = newLikes; likedBy = smile.likedBy.concat([callerPrincipal]) });
        // Notify the smile owner (skip self-likes)
        if (smile.userId != callerPrincipal) {
          let notifId = callerPrincipal.toText() # "-" # smileId # "-" # Time.now().toText();
          let notif : Types.LikeNotificationInternal = {
            id           = notifId;
            smileId;
            smileOwnerId = smile.userId;
            likerName;
            likerId      = callerPrincipal;
            timestamp    = Time.now();
            var read     = false;
          };
          switch (notifications.get(smile.userId)) {
            case null {
              let bucket = List.empty<Types.LikeNotificationInternal>();
              bucket.add(notif);
              notifications.add(smile.userId, bucket);
            };
            case (?bucket) {
              bucket.add(notif);
            };
          };
        };
        #ok(newLikes);
      };
    };
  };

  public func deleteSmile(
    smiles  : Smiles,
    caller  : Principal,
    smileId : Text,
  ) : Common.Result<(), Text> {
    let pred = func(s : Types.Smile) : Bool { s.id == smileId };
    switch (smiles.findIndex<Types.Smile>(pred)) {
      case null { #err("Smile not found") };
      case (?idx) {
        let smile = smiles.at(idx);
        if (smile.userId != caller) {
          return #err("Not authorised to delete this smile");
        };
        let keepPred = func(s : Types.Smile) : Bool { s.id != smileId };
        let filtered = smiles.filter(keepPred);
        smiles.clear();
        smiles.append(filtered);
        #ok(());
      };
    };
  };

  public func getNotifications(
    notifications : Notifications,
    caller        : Principal,
  ) : [Types.LikeNotification] {
    switch (notifications.get(caller)) {
      case null { [] };
      case (?bucket) {
        let arr = bucket.toArray();
        let sorted = arr.sort(func(a : Types.LikeNotificationInternal, b : Types.LikeNotificationInternal) : { #less; #equal; #greater } {
          Int.compare(b.timestamp, a.timestamp);
        });
        sorted.map<Types.LikeNotificationInternal, Types.LikeNotification>(func(n) {
          { id = n.id; smileId = n.smileId; smileOwnerId = n.smileOwnerId; likerName = n.likerName; likerId = n.likerId; timestamp = n.timestamp; read = n.read };
        });
      };
    };
  };

  public func markAllNotificationsRead(
    notifications : Notifications,
    caller        : Principal,
  ) : () {
    switch (notifications.get(caller)) {
      case null {};
      case (?bucket) {
        bucket.mapInPlace(func(n : Types.LikeNotificationInternal) : Types.LikeNotificationInternal {
          n.read := true;
          n;
        });
      };
    };
  };

  // ── Leaderboard ───────────────────────────────────────────────────────────

  func buildLeaderboard(smiles : Smiles, cutoff : Int) : [Types.LeaderboardEntry] {
    let recentPred = func(s : Types.Smile) : Bool { s.createdAt >= cutoff };
    let recent     = smiles.filter(recentPred);

    let sorted = recent.sort(func(a : Types.Smile, b : Types.Smile) : { #less; #equal; #greater } {
      if (a.likes > b.likes) { #less }
      else if (a.likes < b.likes) { #greater }
      else { #equal };
    });

    let totalRecent = sorted.size();
    let takeCount : Int = if (totalRecent < 10) totalRecent.toInt() else 10;
    let top10 = sorted.toArray().sliceToArray(0, takeCount);
    top10.mapEntries(func(s : Types.Smile, i : Nat) : Types.LeaderboardEntry {
      {
        rank        = i + 1;
        smileId     = s.id;
        userId      = s.userId.toText();
        userName    = s.userName;
        userCountry = s.userCountry;
        imageBlobId = s.imageBlobId;
        likes       = s.likes;
        createdAt   = s.createdAt;
      };
    });
  };

  /// Returns top 10 smiles from the past 7 days sorted by likes descending.
  public func getWeeklyLeaderboard(
    smiles : Smiles,
  ) : [Types.LeaderboardEntry] {
    let now         = Time.now();
    let sevenDaysNs : Int = 7 * 24 * 3600 * 1_000_000_000;
    buildLeaderboard(smiles, now - sevenDaysNs);
  };

  /// Returns top 10 smiles from the past 30 days sorted by likes descending.
  public func getMonthlyLeaderboard(
    smiles : Smiles,
  ) : [Types.LeaderboardEntry] {
    let now          = Time.now();
    let thirtyDaysNs : Int = 30 * 24 * 3600 * 1_000_000_000;
    buildLeaderboard(smiles, now - thirtyDaysNs);
  };

  // ── Invite link ───────────────────────────────────────────────────────────

  /// Looks up a smile by its invite code.
  public func getSmileByInvite(
    smiles : Smiles,
    code   : Text,
  ) : Common.Result<Types.Smile, Text> {
    let matchPred = func(s : Types.Smile) : Bool {
      switch (s.inviteCode) {
        case (?c) { c == code };
        case null { false };
      }
    };
    switch (smiles.find<Types.Smile>(matchPred)) {
      case (?smile) { #ok(smile) };
      case null     { #err("No smile found for invite code") };
    };
  };

  // ── Cookie consent ────────────────────────────────────────────────────────

  public func getCookieConsent(
    consent : CookieConsent,
    caller  : Principal,
  ) : Bool {
    switch (consent.get(caller)) {
      case (?v) { v };
      case null { false };
    };
  };

  public func setCookieConsent(
    consent : CookieConsent,
    caller  : Principal,
  ) : () {
    consent.add(caller, true);
  };

  // ── Donation operations ───────────────────────────────────────────────────

  public func recordDonation(
    donations     : Donations,
    caller        : Principal,
    donorName     : Text,
    amount        : Text,
    paymentMethod : Text,
    message       : ?Text,
  ) : Common.Result<Types.Donation, Text> {
    let now  = Time.now();
    let idx  = donations.size();
    let id   = caller.toText() # "-don-" # idx.toText();
    let donation : Types.Donation = {
      id;
      donorName;
      donorPrincipal = caller.toText();
      amount;
      paymentMethod;
      message;
      createdAt = now;
    };
    donations.add(donation);
    #ok(donation);
  };

  public func getDonations(
    donations : Donations,
  ) : [Types.Donation] {
    donations.toArray();
  };

  /// Aggregates donations by donorPrincipal and returns top 10 donors by count.
  public func getTopDonors(
    donations : Donations,
  ) : [Types.TopDonor] {
    // Build a map: donorPrincipal -> (donorName, count)
    let donorMap = Map.empty<Text, (Text, Nat)>();
    for (d in donations.values()) {
      switch (donorMap.get(d.donorPrincipal)) {
        case null {
          donorMap.add(d.donorPrincipal, (d.donorName, 1));
        };
        case (?(name, cnt)) {
          donorMap.add(d.donorPrincipal, (name, cnt + 1));
        };
      };
    };

    // Convert to array and sort by count descending
    let entries = donorMap.entries()
      .map(func((pid, (name, cnt))) {
        (pid, name, cnt)
      })
      .toArray();

    let sorted = entries.sort(func(a : (Text, Text, Nat), b : (Text, Text, Nat)) : { #less; #equal; #greater } {
      let (_, _, ca) = a;
      let (_, _, cb) = b;
      if (ca > cb) { #less }
      else if (ca < cb) { #greater }
      else { #equal };
    });

    let takeCount = if (sorted.size() < 10) sorted.size() else 10;
    sorted.sliceToArray(0, takeCount.toInt()).mapEntries(
      func((pid, name, cnt) : (Text, Text, Nat), i : Nat) : Types.TopDonor {
        {
          rank           = i + 1;
          donorName      = name;
          donorPrincipal = pid;
          totalAmount    = cnt.toText() # " donation" # (if (cnt == 1) "" else "s");
          donationCount  = cnt;
        };
      }
    );
  };

  // ── Account management ────────────────────────────────────────────────────

  public func updateProfile(
    users  : Users,
    caller : Principal,
    input  : Types.UpdateProfileInput,
  ) : Common.Result<Types.UserProfile, Text> {
    switch (users.get(caller)) {
      case null { #err("User not found") };
      case (?profile) {
        if (profile.deactivatedAt != null) {
          return #err("Account is deactivated");
        };
        let updated : Types.UserProfile = {
          profile with
          name     = switch (input.name)     { case (?v) v; case null profile.name };
          email    = switch (input.email)    { case (?v) v; case null profile.email };
          bio      = switch (input.bio)      { case (?v) ?v; case null profile.bio };
          phone    = switch (input.phone)    { case (?v) ?v; case null profile.phone };
          location = switch (input.location) { case (?v) ?v; case null profile.location };
          isPublic = switch (input.isPublic) { case (?v) v; case null profile.isPublic };
        };
        users.add(caller, updated);
        #ok(updated);
      };
    };
  };

  public func updateProfilePicture(
    users  : Users,
    smiles : Smiles,
    caller : Principal,
    blobId : Text,
    picUrl : Text,
  ) : Common.Result<Types.UserProfile, Text> {
    switch (users.get(caller)) {
      case null { #err("User not found") };
      case (?profile) {
        if (profile.deactivatedAt != null) {
          return #err("Account is deactivated");
        };
        ignore blobId; // stored on the object storage side; we record the URL
        let updated : Types.UserProfile = { profile with profilePicUrl = ?picUrl };
        users.add(caller, updated);
        // Also update denormalized profilePicUrl on all existing smiles by this user
        smiles.mapInPlace(
          func(s : Types.Smile) : Types.Smile {
            if (s.userId == caller) { { s with profilePicUrl = ?picUrl } } else { s };
          }
        );
        #ok(updated);
      };
    };
  };

  public func deactivateAccount(
    users  : Users,
    caller : Principal,
  ) : Common.Result<Text, Text> {
    switch (users.get(caller)) {
      case null { #err("User not found") };
      case (?profile) {
        if (profile.deactivatedAt != null) {
          return #err("Account already deactivated");
        };
        let updated : Types.UserProfile = { profile with deactivatedAt = ?Time.now() };
        users.add(caller, updated);
        #ok("Account deactivated. You have 7 days to reactivate before permanent deletion.");
      };
    };
  };

  public func reactivateAccount(
    users  : Users,
    caller : Principal,
  ) : Common.Result<Text, Text> {
    switch (users.get(caller)) {
      case null { #err("User not found") };
      case (?profile) {
        switch (profile.deactivatedAt) {
          case null { #err("Account is not deactivated") };
          case (?_deactivatedTime) {
            let updated : Types.UserProfile = { profile with deactivatedAt = null };
            users.add(caller, updated);
            #ok("Account reactivated successfully. Welcome back!");
          };
        };
      };
    };
  };

  public func deleteAccount(
    users  : Users,
    smiles : Smiles,
    caller : Principal,
  ) : Common.Result<Text, Text> {
    switch (users.get(caller)) {
      case null { #err("User not found") };
      case (?profile) {
        // Enforce 7-day grace period: only allow if deactivated and 7+ days ago
        switch (profile.deactivatedAt) {
          case null { #err("Account must be deactivated first before deletion") };
          case (?deactivatedTime) {
            let sevenDaysNs : Int = 7 * 24 * 60 * 60 * 1_000_000_000;
            if (Time.now() - deactivatedTime < sevenDaysNs) {
              return #err("Grace period has not expired. Account can be reactivated for 7 days after deactivation.");
            };
            // Remove all smiles belonging to this user
            let filtered = smiles.filter(func(s : Types.Smile) : Bool { s.userId != caller });
            smiles.clear();
            smiles.append(filtered);
            users.remove(caller);
            #ok("Account permanently deleted.");
          };
        };
      };
    };
  };

  // ── Smile analytics ───────────────────────────────────────────────────────

  public func recordSmileView(
    smiles  : Smiles,
    smileId : Text,
  ) : () {
    smiles.mapInPlace(
      func(s : Types.Smile) : Types.Smile {
        if (s.id == smileId) { { s with views = s.views + 1 } } else { s };
      }
    );
  };

  public func recordSmileShare(
    smiles  : Smiles,
    smileId : Text,
  ) : () {
    smiles.mapInPlace(
      func(s : Types.Smile) : Types.Smile {
        if (s.id == smileId) { { s with shares = s.shares + 1 } } else { s };
      }
    );
  };

  public func getTrendingSmiles(
    smiles : Smiles,
  ) : [Types.Smile] {
    let sevenDaysNs : Int = 7 * 24 * 60 * 60 * 1_000_000_000;
    let cutoff = Time.now() - sevenDaysNs;
    // Collect recent smiles and sort by likes+shares descending
    let recent = smiles.filter(func(s : Types.Smile) : Bool { s.createdAt >= cutoff }).toArray();
    recent.sort(func(a : Types.Smile, b : Types.Smile) : { #less; #equal; #greater } {
      let scoreA = a.likes + a.shares;
      let scoreB = b.likes + b.shares;
      if (scoreA > scoreB) #less
      else if (scoreA < scoreB) #greater
      else #equal;
    });
  };

  public func getMySmiles(
    smiles : Smiles,
    caller : Principal,
  ) : [Types.Smile] {
    smiles.filter(func(s : Types.Smile) : Bool { s.userId == caller }).toArray();
  };

  public func bulkDeleteSmiles(
    smiles : Smiles,
    caller : Principal,
    ids    : [Text],
  ) : Common.Result<Nat, Text> {
    let before = smiles.size();
    let filtered = smiles.filter(
      func(s : Types.Smile) : Bool {
        let owned = s.userId == caller;
        let inSet = ids.find<Text>(func(id : Text) : Bool { id == s.id }) != null;
        not (owned and inSet);
      }
    );
    smiles.clear();
    smiles.append(filtered);
    let after = smiles.size();
    let count : Nat = if (before > after) { before - after } else { 0 };
    #ok(count);
  };

  public func getSmileAnalytics(
    smiles  : Smiles,
    caller  : Principal,
    smileId : Text,
  ) : Common.Result<{ views : Nat; likes : Nat; shares : Nat }, Text> {
    switch (smiles.find(func(s : Types.Smile) : Bool { s.id == smileId })) {
      case null { #err("Smile not found") };
      case (?smile) {
        if (smile.userId != caller) {
          return #err("Not authorized");
        };
        #ok({ views = smile.views; likes = smile.likes; shares = smile.shares });
      };
    };
  };

  // ── Admin operations ──────────────────────────────────────────────────────

  public func getAdminStats(
    users     : Users,
    smiles    : Smiles,
    donations : Donations,
  ) : Types.AdminStats {
    {
      totalUsers     = users.size();
      totalSmiles    = smiles.size();
      totalDonations = donations.size();
    };
  };

  public func getAllUsers(
    users : Users,
  ) : [Types.UserSummary] {
    users.entries().map<(Principal, Types.UserProfile), Types.UserSummary>(
      func((id, u)) {
        { id; name = u.name; country = u.country; totalSmiles = u.totalSmiles };
      }
    ).toArray();
  };
};
