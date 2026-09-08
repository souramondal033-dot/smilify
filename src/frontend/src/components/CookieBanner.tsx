import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Cookie, X } from "lucide-react";
import { createActor } from "../backend";
import type { View } from "../lib/types";

const COOKIE_KEY = "smilify-cookie-consent";

interface CookieBannerProps {
  onNavigate: (view: View) => void;
  onDismiss: () => void;
}

export function CookieBanner({ onNavigate, onDismiss }: CookieBannerProps) {
  const { loginStatus } = useInternetIdentity();
  const { actor } = useActor(createActor);

  const handleAccept = async () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    if (loginStatus === "success" && actor) {
      try {
        await actor.setCookieConsent();
      } catch {
        // Best-effort — local storage already set
      }
    }
    onDismiss();
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    onDismiss();
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[900] px-4 pb-5 slide-in-from-bottom"
      data-ocid="cookie_banner"
    >
      <div className="max-w-md mx-auto bg-card border border-border rounded-3xl shadow-pookie-lg p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-2xl gradient-pink-rose flex-shrink-0 flex items-center justify-center shadow-pookie mt-0.5">
            <Cookie size={16} className="text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground mb-1">
              We use cookies 🍪
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use cookies to enhance your experience and keep Smilify running
              smoothly. See our{" "}
              <button
                type="button"
                onClick={() => onNavigate("terms")}
                className="text-primary font-bold underline underline-offset-2"
                data-ocid="cookie_banner.terms.link"
              >
                Terms
              </button>{" "}
              &amp;{" "}
              <button
                type="button"
                onClick={() => onNavigate("privacy")}
                className="text-primary font-bold underline underline-offset-2"
                data-ocid="cookie_banner.privacy.link"
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={handleDecline}
            className="w-7 h-7 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth"
            aria-label="Dismiss"
            data-ocid="cookie_banner.close_button"
          >
            <X size={13} />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 py-3 bg-muted border border-border text-foreground rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-smooth"
            data-ocid="cookie_banner.decline_button"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 py-3 gradient-pink-rose text-primary-foreground rounded-2xl font-bold text-xs uppercase tracking-widest shadow-pookie active:scale-95 transition-smooth"
            data-ocid="cookie_banner.accept_button"
          >
            Accept All 🎀
          </button>
        </div>
      </div>
    </div>
  );
}

/** Returns true if the user has NOT yet made a cookie consent choice */
export function needsCookieConsent(): boolean {
  return !localStorage.getItem(COOKIE_KEY);
}
