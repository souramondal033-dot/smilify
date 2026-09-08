import { useActor } from "@caffeineai/core-infrastructure";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createActor } from "../backend";
import type { LikeNotification } from "../backend";

function formatRelative(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function NotificationBell() {
  const { actor } = useActor(createActor);
  const [notifications, setNotifications] = useState<LikeNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!actor) return;
    try {
      const result = await actor.getNotifications();
      setNotifications(result);
    } catch {
      // silent — bell is non-critical
    }
  }, [actor]);

  // Initial fetch + poll every 30 seconds
  useEffect(() => {
    void fetchNotifications();
    const interval = setInterval(() => void fetchNotifications(), 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleBellClick = async () => {
    setIsOpen(!isOpen);
    if (unreadCount > 0) {
      // Mark all as read on every click when there are unread notifications
      try {
        await actor?.markAllNotificationsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error(
          "[NotificationBell] Failed to mark notifications as read:",
          err,
        );
        // Surface error so user knows it failed — per no-silent-failures requirement
        alert("Could not mark notifications as read. Please try again.");
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleBellClick}
        className="w-10 h-10 rounded-full bg-card border-2 border-border shadow-xs flex items-center justify-center text-muted-foreground hover:text-primary active:scale-90 transition-smooth relative"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        data-ocid="notifications.bell_button"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center border-2 border-background shadow-xs animate-pulse"
            aria-hidden="true"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-12 w-80 bg-card border border-border rounded-[2rem] shadow-pookie-lg z-[500] overflow-hidden fade-in"
          data-ocid="notifications.popover"
        >
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-primary" />
              <span className="text-[11px] font-black text-foreground uppercase tracking-widest">
                Notifications
              </span>
            </div>
            {unreadCount === 0 && notifications.length > 0 && (
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                All read ✓
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <div
                className="py-10 text-center"
                data-ocid="notifications.empty_state"
              >
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-[11px] font-bold text-foreground mb-1">
                  No notifications yet!
                </p>
                <p className="text-[9px] text-muted-foreground font-bold">
                  We'll tell you when someone likes your smile 💖
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.slice(0, 20).map((notif, i) => (
                  <li
                    key={notif.id}
                    className={`px-5 py-3.5 flex items-start gap-3 transition-colors ${
                      !notif.read ? "bg-primary/5" : ""
                    }`}
                    data-ocid={`notifications.item.${i + 1}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm">💖</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-foreground leading-snug">
                        <span className="text-primary">{notif.likerName}</span>
                        {" liked your smile! 🎀"}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                        {formatRelative(notif.timestamp)}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
