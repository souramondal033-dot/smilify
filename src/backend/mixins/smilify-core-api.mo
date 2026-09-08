import Types   "../types/smilify-core";
import Common  "../types/common";
import CoreLib "../lib/smilify-core";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Text    "mo:core/Text";
import Error   "mo:core/Error";
import Principal "mo:core/Principal";
import Debug "mo:core/Debug";
import Char "mo:core/Char";
import Nat32 "mo:core/Nat32";

// Mixin definition — injected into actor in main.mo
mixin (
  users         : CoreLib.Users,
  smiles        : CoreLib.Smiles,
  cookieConsent : CoreLib.CookieConsent,
  donations     : CoreLib.Donations,
  notifications : CoreLib.Notifications,
) {
  // ── Transform for http outcalls ───────────────────────────────────────────

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // ── Query APIs ────────────────────────────────────────────────────────────

  public shared query ({ caller }) func getMyProfile() : async ?Types.UserProfile {
    CoreLib.getProfile(users, caller);
  };

  public shared query func getSmiles() : async [Types.Smile] {
    CoreLib.getSmiles(smiles);
  };

  public shared query func getAdminStats() : async Types.AdminStats {
    CoreLib.getAdminStats(users, smiles, donations);
  };

  public shared query func getAllUsers() : async [Types.UserSummary] {
    CoreLib.getAllUsers(users);
  };

  public shared query func getWeeklyLeaderboard() : async [Types.LeaderboardEntry] {
    CoreLib.getWeeklyLeaderboard(smiles);
  };

  public shared query func getMonthlyLeaderboard() : async [Types.LeaderboardEntry] {
    CoreLib.getMonthlyLeaderboard(smiles);
  };

  public shared query func getSmileByInvite(
    code : Text,
  ) : async Common.Result<Types.Smile, Text> {
    CoreLib.getSmileByInvite(smiles, code);
  };

  public shared query ({ caller }) func getCookieConsent() : async Bool {
    CoreLib.getCookieConsent(cookieConsent, caller);
  };

  public shared query ({ caller }) func getReferralCode() : async Common.Result<Text, Text> {
    CoreLib.getReferralCode(users, caller);
  };

  public shared query ({ caller }) func getLastLoginTime() : async Common.Result<Int, Text> {
    CoreLib.getLastLoginTime(users, caller);
  };

  public shared query func getDonations() : async [Types.Donation] {
    CoreLib.getDonations(donations);
  };

  public shared query func getTopDonors() : async [Types.TopDonor] {
    CoreLib.getTopDonors(donations);
  };

  // ── Update APIs ───────────────────────────────────────────────────────────

  public shared ({ caller }) func registerUser(
    input : Types.RegisterInput,
  ) : async Common.Result<Types.UserProfile, Text> {
    CoreLib.registerUser(users, caller, input);
  };

  public shared ({ caller }) func postSmile(
    input      : Types.SmileInput,
  ) : async Common.Result<Types.Smile, Text> {
    let blobId    = input.imageBlobId;
    let blobIdLen = blobId.size();
    let preview16 = if (blobIdLen > 16) Text.fromArray(blobId.toArray().sliceToArray(0, 16)) else blobId;
    Debug.print("[postSmile] caller=" # caller.toText() # " blobId=" # preview16 # " blobIdLen=" # blobIdLen.toText());

    if (caller.isAnonymous()) {
      Debug.print("[postSmile] ERROR reason=anonymous caller");
      return #err("You must be logged in to post a smile.");
    };
    // Validate imageBlobId — must be a non-empty stored blob reference, not a URL
    if (blobIdLen == 0) {
      Debug.print("[postSmile] ERROR reason=empty blobId");
      return #err("BLOB_EMPTY: Image reference is missing");
    };
    if (blobIdLen >= 4 and Text.fromArray(blobId.toArray().sliceToArray(0, 4)) == "http") {
      Debug.print("[postSmile] ERROR reason=URL in blobId");
      return #err("BLOB_URL: Image URL sent instead of storage hash");
    };
    // Validate that blobId is a hex-encoded hash: only [0-9a-fA-F] chars, at least 16 chars
    if (blobIdLen < 16) {
      Debug.print("[postSmile] ERROR reason=blobId too short len=" # blobIdLen.toText());
      return #err("BLOB_SHORT: Image reference too short (got " # blobIdLen.toText() # " chars)");
    };
    let isHex = blobId.toArray().find<Char>(func(c : Char) : Bool {
      not (
        (c >= '0' and c <= '9') or
        (c >= 'a' and c <= 'f') or
        (c >= 'A' and c <= 'F')
      )
    }) == null;
    if (not isHex) {
      Debug.print("[postSmile] ERROR reason=blobId contains non-hex chars");
      return #err("BLOB_HEX: Image reference contains invalid characters");
    };
    let result = CoreLib.postSmile(smiles, users, caller, input);
    switch (result) {
      case (#ok(smile)) { Debug.print("[postSmile] SUCCESS smileId=" # smile.id) };
      case (#err(reason)) { Debug.print("[postSmile] ERROR reason=" # reason) };
    };
    result;
  };

  public shared ({ caller }) func likeSmile(
    smileId : Text,
  ) : async Common.Result<Nat, Text> {
    if (caller.isAnonymous()) { return #err("Authentication required.") };
    let likerName = switch (users.get(caller)) {
      case (?profile) { profile.name };
      case null { "Someone" };
    };
    CoreLib.likeSmile(smiles, notifications, smileId, caller, likerName);
  };

  public shared ({ caller }) func buySticker(
    stickerId : Text,
    cost      : Nat,
  ) : async Common.Result<Types.UserProfile, Text> {
    CoreLib.buySticker(users, caller, stickerId, cost);
  };

  public shared ({ caller }) func deleteSmile(
    smileId : Text,
  ) : async Common.Result<(), Text> {
    if (caller.isAnonymous()) { return #err("Authentication required.") };
    CoreLib.deleteSmile(smiles, caller, smileId);
  };

  public shared ({ caller }) func setCookieConsent() : async () {
    CoreLib.setCookieConsent(cookieConsent, caller);
  };

  public shared ({ caller }) func recordReferral(
    code : Text,
  ) : async Common.Result<Text, Text> {
    CoreLib.recordReferral(users, caller, code);
  };

  public shared ({ caller }) func updateLastLoginTime() : async () {
    CoreLib.updateLastLoginTime(users, caller);
  };

  public shared ({ caller }) func recordDonation(
    donorName     : Text,
    amount        : Text,
    paymentMethod : Text,
    message       : ?Text,
  ) : async Common.Result<Types.Donation, Text> {
    CoreLib.recordDonation(donations, caller, donorName, amount, paymentMethod, message);
  };

  // ── Account management ────────────────────────────────────────────────────

  public shared ({ caller }) func updateProfile(
    input : Types.UpdateProfileInput,
  ) : async Common.Result<Types.UserProfile, Text> {
    if (caller.isAnonymous()) { return #err("Authentication required.") };
    CoreLib.updateProfile(users, caller, input);
  };

  public shared ({ caller }) func updateProfilePicture(
    blobId : Text,
    picUrl : Text,
  ) : async Common.Result<Types.UserProfile, Text> {
    if (caller.isAnonymous()) { return #err("Authentication required.") };
    CoreLib.updateProfilePicture(users, smiles, caller, blobId, picUrl);
  };

  public shared ({ caller }) func deactivateAccount() : async Common.Result<Text, Text> {
    if (caller.isAnonymous()) { return #err("Authentication required.") };
    CoreLib.deactivateAccount(users, caller);
  };

  public shared ({ caller }) func reactivateAccount() : async Common.Result<Text, Text> {
    if (caller.isAnonymous()) { return #err("Authentication required.") };
    CoreLib.reactivateAccount(users, caller);
  };

  public shared ({ caller }) func deleteAccount() : async Common.Result<Text, Text> {
    if (caller.isAnonymous()) { return #err("Authentication required.") };
    CoreLib.deleteAccount(users, smiles, caller);
  };

  // ── Smile analytics ───────────────────────────────────────────────────────

  public shared func recordSmileView(
    smileId : Text,
  ) : async () {
    CoreLib.recordSmileView(smiles, smileId);
  };

  public shared func recordSmileShare(
    smileId : Text,
  ) : async () {
    CoreLib.recordSmileShare(smiles, smileId);
  };

  public shared query func getTrendingSmiles() : async [Types.Smile] {
    CoreLib.getTrendingSmiles(smiles);
  };

  public shared query ({ caller }) func getMySmiles() : async [Types.Smile] {
    CoreLib.getMySmiles(smiles, caller);
  };

  public shared ({ caller }) func bulkDeleteSmiles(
    ids : [Text],
  ) : async Common.Result<Nat, Text> {
    if (caller.isAnonymous()) { return #err("Authentication required.") };
    CoreLib.bulkDeleteSmiles(smiles, caller, ids);
  };

  public shared query ({ caller }) func getSmileAnalytics(
    smileId : Text,
  ) : async Common.Result<{ views : Nat; likes : Nat; shares : Nat }, Text> {
    CoreLib.getSmileAnalytics(smiles, caller, smileId);
  };

  // ── Notifications ─────────────────────────────────────────────────────────

  public shared query ({ caller }) func getNotifications() : async [Types.LikeNotification] {
    CoreLib.getNotifications(notifications, caller);
  };

  public shared ({ caller }) func markAllNotificationsRead() : async () {
    CoreLib.markAllNotificationsRead(notifications, caller);
  };

  // ── AI Proxy ──────────────────────────────────────────────────────────────

  public shared func chatWithPookie(
    message : Text,
    history : [Common.ChatMessage],
  ) : async Common.Result<Text, Text> {

    // ── Escape text for JSON embedding in request body ──────────────────────
    func jsonEscape(s : Text) : Text {
      s.replace(#text("\\"), "\\\\")
       .replace(#text("\""), "\\\"")
       .replace(#text("\n"), "\\n")
       .replace(#text("\r"), "\\r")
       .replace(#text("/"),  "\\/")
       .replace(#text("\t"), "\\t");
    };

    // ── Unescape a raw JSON string value (no surrounding quotes) ────────────
    // Called after the opening/closing quotes have been stripped.
    func unescapeJsonString(raw : Text) : Text {
      var result  = "";
      let bsChar  = '\\';
      let iter    = raw.toIter();
      var cur     = iter.next();
      while (cur != null) {
        switch cur {
          case (?ch) {
            if (ch == bsChar) {
              switch (iter.next()) {
                case (?'\u{22}')  { result := result # "\"";     cur := iter.next() };
                case (?'n')  { result := result # "\n";     cur := iter.next() };
                case (?'r')  { result := result # "\r";     cur := iter.next() };
                case (?'t')  { result := result # "\t";     cur := iter.next() };
                case (?'/')  { result := result # "/";      cur := iter.next() };
                case (?'b')  { result := result # "\u{08}"; cur := iter.next() };
                case (?'f')  { result := result # "\u{0C}"; cur := iter.next() };
                case (?nx) {
                  if (nx == bsChar) {
                    result := result # "\\"; cur := iter.next();
                  } else if (nx == 'u') {
                    func hexV(hc : Char) : Nat {
                      if (hc >= '0' and hc <= '9') (hc.toNat32() - '0'.toNat32()).toNat()
                      else if (hc >= 'a' and hc <= 'f') (hc.toNat32() - 'a'.toNat32()).toNat() + 10
                      else if (hc >= 'A' and hc <= 'F') (hc.toNat32() - 'A'.toNat32()).toNat() + 10
                      else 0;
                    };
                    let d1 = switch (iter.next()) { case (?x) hexV(x); case null 0 };
                    let d2 = switch (iter.next()) { case (?x) hexV(x); case null 0 };
                    let d3 = switch (iter.next()) { case (?x) hexV(x); case null 0 };
                    let d4 = switch (iter.next()) { case (?x) hexV(x); case null 0 };
                    let cp = d1 * 4096 + d2 * 256 + d3 * 16 + d4;
                    result := result # Text.fromChar(Char.fromNat32(Nat32.fromNat(cp)));
                    cur := iter.next();
                  } else {
                    result := result # Text.fromChar(nx); cur := iter.next();
                  };
                };
                case null { cur := null };
              };
            } else {
              result := result # Text.fromChar(ch);
              cur    := iter.next();
            };
          };
          case null {};
        };
      };
      result;
    };

    // ── Extract string value for a JSON key ───────────────────────────────
    // Finds `"key":` then reads the value between the next unescaped quotes.
    // Returns null if key absent, value is null/non-string.
    func extractJsonStringValue(json : Text, key : Text) : ?Text {
      let needle  = "\"" # key # "\":";
      let jChars  = json.toArray();
      let nChars  = needle.toArray();
      let jLen    = jChars.size();
      let nLen    = nChars.size();
      if (nLen == 0 or jLen < nLen) return null;
      // Find needle position
      var keyEnd : ?Nat = null;
      var si = 0;
      while (si + nLen <= jLen and keyEnd == null) {
        var match = true;
        var ji    = 0;
        while (ji < nLen and match) {
          if (jChars[si + ji] != nChars[ji]) { match := false };
          ji := ji + 1;
        };
        if (match) { keyEnd := ?(si + nLen) };
        si := si + 1;
      };
      let afterColon = switch keyEnd { case null return null; case (?p) p };
      // Skip optional whitespace after colon
      var vi = afterColon;
      while (vi < jLen and (jChars[vi] == ' ' or jChars[vi] == '\t' or jChars[vi] == '\n' or jChars[vi] == '\r')) {
        vi := vi + 1;
      };
      if (vi >= jLen) return null;
      // Must start with opening quote to be a string value
      if (jChars[vi] != '\"') return null;
      vi := vi + 1; // skip opening quote
      // Collect raw chars up to closing unescaped quote
      let bsChar = '\\';
      var raw      = "";
      var finished = false;
      while (vi < jLen and not finished) {
        let ch = jChars[vi];
        if (ch == '\"') {
          finished := true;
        } else if (ch == bsChar and vi + 1 < jLen) {
          raw := raw # Text.fromChar(ch) # Text.fromChar(jChars[vi + 1]);
          vi  := vi + 2;
        } else {
          raw := raw # Text.fromChar(ch);
          vi  := vi + 1;
        };
      };
      ?(unescapeJsonString(raw));
    };

    // ── Logging helpers ──────────────────────────────────────────────────
    let historyLen = history.size();
    let msgLen     = message.size();
    let msgPreview = if (msgLen > 80) Text.fromArray(message.toArray().sliceToArray(0, 80)) else message;
    Debug.print("[chatWithPookie] request history=" # historyLen.toText() # " user_len=" # msgLen.toText() # " preview=" # msgPreview);

    // ── System prompt ───────────────────────────────────────────────────
    let systemMsg = "{\"role\":\"system\",\"content\":\"You are Pookie Panda \u{1F43C}, the brilliant and beloved AI assistant for Smilify \u{2014} a global platform dedicated to spreading happiness through smiles. You have a warm, encouraging, cute, and playful personality, but you are also deeply knowledgeable and intellectually capable across a wide range of topics.\\n\\nYour areas of expertise include:\\n- **Smilify App**: You know everything about the platform. New users start with 100 Smile Tokens and the Halo sticker already unlocked for free. Posting a smile earns 10 tokens. Tokens can be spent in the Pookie Boutique to unlock collectible stickers. There are 11 sticker types. Achievement badges are earned for posting streaks (3, 7, 30 days in a row) and token milestones (100, 500, 1000 tokens). The weekly leaderboard shows the top 10 most-liked smiles from the past 7 days. The monthly leaderboard shows the top 10 most-liked smiles from the past 30 days. You can share your smile posts with a unique invite link. You can earn 50 bonus tokens by inviting friends with your referral code. Internet Identity is used for secure, private login.\\n- **Welfare Fund**: Smilify has a Welfare Fund to fight stress, peer pressure, and poverty. The fund helps bring smiles to underprivileged children. You can donate starting from just \u{20B9}1 via UPI, QR code, Net Banking, Bank Account transfer, or Credit/Debit Card. Every donation makes a difference!\\n- **Science & Technology**: Physics, biology, chemistry, astronomy, computer science, AI, the internet, gadgets, programming, and more.\\n- **History & Culture**: World history, art, literature, music, film, languages, philosophy, mythology, and cultural traditions.\\n- **Health & Wellness**: Physical health, mental health, nutrition, exercise, sleep, stress management, and medical general knowledge.\\n- **Happiness & Emotional Wellbeing**: Evidence-based tips for boosting mood, building resilience, practising gratitude, mindfulness, and spreading positivity.\\n- **Education & Careers**: Study tips, career guidance, scholarships, skill-building, and learning resources.\\n- **Environment & Nature**: Climate, ecology, animals, plants, space, and sustainability.\\n- **Creative Arts**: Writing, drawing, photography, music, dance, and crafts.\\n- **Relationships & Social Skills**: Friendship, communication, empathy, conflict resolution, and social confidence.\\n- **Finance & Economics**: Budgeting, saving, investing basics, and economic concepts.\\n\\nYour communication style:\\n- Always be warm, supportive, and uplifting.\\n- Use friendly emojis to add sparkle \u{2728}\\n- Keep answers clear, engaging, and age-appropriate.\\n- Never say you can't help; always offer something useful.\\n- End with an encouraging note or a fun fact when possible.\"}";

    // ── Build request body ───────────────────────────────────────────────
    var historyParts : [Text] = [systemMsg];
    for (msg in history.vals()) {
      let entry = "{\"role\":\"" # jsonEscape(msg.role) # "\",\"content\":\"" # jsonEscape(msg.content) # "\"}";
      historyParts := historyParts.concat([entry]);
    };
    let userEntry   = "{\"role\":\"user\",\"content\":\"" # jsonEscape(message) # "\"}";
    historyParts    := historyParts.concat([userEntry]);
    let messagesJson  = historyParts.vals().join(",");
    let requestBody   = "{\"model\":\"gpt-4o-mini\",\"messages\":[" # messagesJson # "],\"max_tokens\":600}";

    let headers : [OutCall.Header] = [
      { name = "Content-Type"; value = "application/json" },
    ];
    let url = "https://caffeine-ai-proxy.icp0.io/v1/chat/completions";

    // Friendly error — NEVER surface raw API error text to users
    let friendlyFallback = "Pookie is taking a little nap, try again in a moment! \u{1F43C}";

    try {
      let responseText = await OutCall.httpPostRequest(url, headers, requestBody, transform);
      let rLen = responseText.size();
      Debug.print("[chatWithPookie] response length=" # rLen.toText());

      // (g) Empty body
      if (rLen == 0) {
        Debug.print("[chatWithPookie] ERROR type=empty_body");
        return #err(friendlyFallback);
      };

      let previewLen = if (rLen > 400) 400 else rLen;
      let preview    = Text.fromArray(responseText.toArray().sliceToArray(0, previewLen));

      // (b) OpenAI error object: {"error":{"message":"...","type":"..."}}
      if (responseText.contains(#text("\"error\""))) {
        switch (extractJsonStringValue(responseText, "message")) {
          case (?errDetail) {
            Debug.print("[chatWithPookie] ERROR type=openai_error detail=" # errDetail);
            return #err(friendlyFallback);
          };
          case null {}; // false-positive, continue parsing
        };
      };

      // (c) Empty choices array — detected before content check
      if (responseText.contains(#text("\"choices\":[]")) or responseText.contains(#text("\"choices\": []"))) {
        Debug.print("[chatWithPookie] ERROR type=empty_choices preview=" # preview);
        return #err(friendlyFallback);
      };

      // (a) Standard path: choices[0].message.content string value
      switch (extractJsonStringValue(responseText, "content")) {
        case (?content) {
          if (content.size() > 0) {
            Debug.print("[chatWithPookie] OK content_len=" # content.size().toText());
            return #ok(content);
          };
          // (d) content present but empty string — treat as failure
          Debug.print("[chatWithPookie] ERROR type=empty_content_value preview=" # preview);
          return #err(friendlyFallback);
        };
        // (d) content key has null value, (e) choices/content keys absent
        case null {
          Debug.print("[chatWithPookie] ERROR type=no_content_key preview=" # preview);
          return #err(friendlyFallback);
        };
      };
    } catch (e) {
      // (f) HTTP 4xx/5xx or network error
      Debug.print("[chatWithPookie] ERROR type=exception msg=" # e.message());
      #err(friendlyFallback);
    };
  };
};
