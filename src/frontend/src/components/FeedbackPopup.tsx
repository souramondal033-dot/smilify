import { useEffect, useState } from "react";

const STORAGE_KEY = "smilify_feedback_shown_date";
const LATER_KEY = "smilify_feedback_ask_later";
const DELAY_MS = 3 * 60 * 1000; // 3 minutes
const LATER_DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours

function shouldShow(): boolean {
  const today = new Date().toDateString();
  const shownDate = localStorage.getItem(STORAGE_KEY);
  if (shownDate === today) return false;

  const laterUntil = localStorage.getItem(LATER_KEY);
  if (laterUntil && Date.now() < Number(laterUntil)) return false;

  return true;
}

export function FeedbackPopup() {
  const [visible, setVisible] = useState(false);
  const [noClicks, setNoClicks] = useState(0);
  const [showResult, setShowResult] = useState<"yes" | null>(null);
  const [showAskLater, setShowAskLater] = useState(true);

  useEffect(() => {
    if (!shouldShow()) return;
    const t = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const markShown = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toDateString());
  };

  const handleYes = () => {
    markShown();
    localStorage.removeItem(LATER_KEY);
    setShowResult("yes");
    setTimeout(() => setVisible(false), 3200);
  };

  const handleNo = () => {
    const next = noClicks + 1;
    setNoClicks(next);
    if (next >= 2) {
      setShowAskLater(false);
    }
  };

  const handleLater = () => {
    localStorage.setItem(LATER_KEY, String(Date.now() + LATER_DELAY_MS));
    setVisible(false);
  };

  if (!visible) return null;

  // Font size grows with each No click — capped to keep it playful not destructive
  const noFontSize = `${Math.min(0.75 + noClicks * 0.18, 1.6)}rem`;

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)" }}
      data-ocid="feedback.dialog"
    >
      <div
        className="w-full max-w-sm rounded-[2.5rem] p-8 text-center zoom-in shadow-pookie-lg"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.98 0.04 340) 0%, oklch(0.97 0.05 280) 100%)",
          border: "2px solid oklch(0.90 0.10 340)",
        }}
      >
        {showResult === "yes" ? (
          /* ── YES celebration ───────────────────── */
          <div className="space-y-4 fade-in" data-ocid="feedback.success_state">
            <div className="text-6xl animate-bounce-gentle">🎉</div>
            <h3 className="text-xl font-black text-foreground leading-tight">
              Yay! You made Pookie so happy!
            </h3>
            <p className="text-lg">🐼💖</p>
            <p className="text-sm font-bold text-muted-foreground leading-relaxed">
              Keep spreading those beautiful smiles! The world needs more
              pookies like you! ✨
            </p>
          </div>
        ) : (
          /* ── Main prompt ───────────────────────── */
          <>
            {/* Pookie Panda face */}
            <div className="mb-4 relative inline-block">
              <span className="text-6xl">
                {noClicks === 0 ? "🐼" : noClicks === 1 ? "🥺" : "😭"}
              </span>
              {noClicks > 0 && (
                <span className="absolute -top-2 -right-3 text-2xl animate-pulse-soft">
                  😢
                </span>
              )}
            </div>

            <h3 className="text-lg font-black text-foreground mb-1">
              Do you like Smilify?
            </h3>
            <p className="text-xs font-bold text-muted-foreground mb-6">
              Tell Pookie the truth! 🐼
            </p>

            {/* No warning message */}
            {noClicks >= 2 && (
              <div
                className="mb-4 p-3 rounded-2xl border fade-in"
                style={{
                  background: "oklch(0.96 0.05 10)",
                  borderColor: "oklch(0.88 0.12 15)",
                }}
              >
                <p className="text-xs font-black text-foreground leading-relaxed">
                  Pookie does not accept that answer! 🐼💔
                  <br />
                  You must choose Yes or No only!
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              {/* YES button */}
              <button
                type="button"
                onClick={handleYes}
                className="w-full py-4 rounded-[2rem] font-black text-base text-white transition-smooth active:scale-[0.97] shadow-pookie"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.25 12), oklch(0.78 0.22 340))",
                }}
                data-ocid="feedback.yes.button"
              >
                Yes! 💖
              </button>

              {/* NO button — grows with each click */}
              <button
                type="button"
                onClick={handleNo}
                className="w-full py-3 rounded-[2rem] font-black transition-smooth active:scale-[0.97] border"
                style={{
                  fontSize: noFontSize,
                  background: "oklch(0.97 0.02 20)",
                  borderColor: "oklch(0.88 0.08 20)",
                  color: "oklch(0.45 0.15 20)",
                }}
                data-ocid="feedback.no.button"
              >
                No{noClicks > 0 ? " 😢".repeat(Math.min(noClicks, 3)) : ""}
              </button>

              {/* Ask me later — appears after first No, disappears after second */}
              {noClicks >= 1 && showAskLater && (
                <button
                  type="button"
                  onClick={handleLater}
                  className="text-xs font-black text-muted-foreground py-1 transition-smooth hover:text-primary fade-in"
                  data-ocid="feedback.later.button"
                >
                  Ask me later 🐼
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
