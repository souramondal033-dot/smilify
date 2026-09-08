// ── Pookie Web Notifications Utility ────────────────────────────────────────
// All Notification API calls are guarded — safe in any browser environment.

const LOGO_URL =
  "https://i.postimg.cc/0Nfmpwh4/file_00000000c98c71faa51a2abea74b0d5c.png";

const LS_PERMISSION_KEY = "pookie_notif_permission";
const LS_LAST_SENT_KEY = "pookie_notif_last_sent";
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export const POOKIE_MESSAGES = [
  "Hey pookie! Come spread some smiles today 😊",
  "Miss you pookie! The global feed needs your smile 🐼",
  "Your smile can brighten someone's day pookie! 💛",
  "Ready to bring joy pookie? Let's go 🌟",
] as const;

/** Checks browser support safely */
function notificationsSupported(): boolean {
  return typeof window !== "undefined" && typeof Notification !== "undefined";
}

/**
 * Requests notification permission if not already granted or denied.
 * Stores the result in localStorage. Never throws.
 */
export async function requestPookieNotificationPermission(): Promise<void> {
  if (!notificationsSupported()) return;
  try {
    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      localStorage.setItem(LS_PERMISSION_KEY, result);
    } else {
      localStorage.setItem(LS_PERMISSION_KEY, Notification.permission);
    }
  } catch {
    // Silent — permission request is best-effort
  }
}

/**
 * Sends a Web Notification with the Smilify branding.
 * Only fires if permission is granted. Never throws.
 */
export function sendPookieNotification(message: string): void {
  if (!notificationsSupported()) return;
  try {
    if (Notification.permission !== "granted") return;
    new Notification("Smilify 🐼", {
      body: message,
      icon: LOGO_URL,
    });
  } catch {
    // Silent — notification is non-critical
  }
}

/**
 * Triggers a re-engagement notification if >7 days since last login,
 * throttled to once every 3 days.
 *
 * Fires BOTH:
 *  - A Web Notification (if permission granted)
 *  - A CustomEvent 'pookie:reengage' for in-app toast
 */
export function triggerReEngagementNotification(lastLoginTime: number): void {
  if (!notificationsSupported()) return;
  try {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const nowMs = Date.now();

    if (nowMs - lastLoginTime <= SEVEN_DAYS_MS) return;

    const lastSent = localStorage.getItem(LS_LAST_SENT_KEY);
    if (lastSent && nowMs - Number(lastSent) < THREE_DAYS_MS) return;

    localStorage.setItem(LS_LAST_SENT_KEY, String(nowMs));

    const message =
      POOKIE_MESSAGES[Math.floor(Math.random() * POOKIE_MESSAGES.length)] ??
      POOKIE_MESSAGES[0];

    // Web push notification
    sendPookieNotification(message);

    // In-app toast via CustomEvent
    try {
      window.dispatchEvent(
        new CustomEvent("pookie:reengage", { detail: message }),
      );
    } catch {
      // silent
    }
  } catch {
    // Silent — re-engagement is non-critical
  }
}
