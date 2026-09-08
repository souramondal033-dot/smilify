import Map       "mo:core/Map";
import List      "mo:core/List";
import Types     "types/smilify-core";
import CoreLib   "lib/smilify-core";
import Mixin     "mixins/smilify-core-api";
import Migration "migration";







(with migration = Migration.run)
actor {
  // ── Stable state ──────────────────────────────────────────────────────────
  let users         : CoreLib.Users         = Map.empty<Principal, Types.UserProfile>();
  let smiles        : CoreLib.Smiles        = List.empty<Types.Smile>();
  let cookieConsent : CoreLib.CookieConsent = Map.empty<Principal, Bool>();
  let donations     : CoreLib.Donations     = List.empty<Types.Donation>();
  let notifications : CoreLib.Notifications = Map.empty<Principal, List.List<Types.LikeNotificationInternal>>();

  // ── Composition ───────────────────────────────────────────────────────────
  include Mixin(users, smiles, cookieConsent, donations, notifications);
};
