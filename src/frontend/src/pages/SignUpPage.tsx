import { useActor } from "@caffeineai/core-infrastructure";
import { Check, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { createActor } from "../backend";
import { ASSETS, COUNTRIES } from "../lib/constants";
import type { BadgeId, UserProfile, View } from "../lib/types";

interface SignUpPageProps {
  onProfileCreated: (profile: UserProfile) => void;
  onToast: (msg: string) => void;
  onNavigate: (view: View) => void;
}

export default function SignUpPage({
  onProfileCreated,
  onToast,
  onNavigate,
}: SignUpPageProps) {
  const { actor } = useActor(createActor);
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: COUNTRIES[0] ?? "Global",
    isHuman: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return onToast("Enter your pookie name! 🎀");
    if (!form.email.includes("@"))
      return onToast("Enter a valid email pookie! 💌");
    if (!form.isHuman) return onToast("Check the human box pookie! 🐼");
    if (!actor) return onToast("Connecting... try again pookie! 🐼");

    setIsSubmitting(true);
    try {
      const result = await actor.registerUser({
        name: form.name,
        email: form.email,
        country: form.country,
      });

      if (result.__kind__ === "ok") {
        const bp = result.ok;
        const newProfile: UserProfile = {
          name: bp.name,
          email: bp.email,
          country: bp.country,
          tokens: Number(bp.tokens),
          totalSmiles: Number(bp.totalSmiles),
          unlockedStickers: bp.unlockedStickers,
          uid: bp.id.toString(),
          joinedAt: bp.joinedAt
            ? { seconds: Number(bp.joinedAt / 1_000_000_000n) }
            : undefined,
          badges: bp.badges.map((b) => ({
            id: String(b.id) as BadgeId,
            name: b.name,
            description: b.description,
            icon: b.icon,
            earnedAt: b.earnedAt,
          })),
          lastPostDate: bp.lastPostDate,
          currentStreak: bp.currentStreak,
        };
        onProfileCreated(newProfile);
        onToast(`Welcome to Smilify, ${form.name}! 🎀`);
      } else {
        onToast(result.err ?? "Registration failed pookie! 😢");
      }
    } catch {
      onToast("Something went wrong pookie! Try again 🐼");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 bg-primary blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-15 bg-accent blur-3xl" />
      </div>

      {/* Floating decorations */}
      <span className="pointer-events-none absolute top-16 right-8 text-3xl opacity-20 animate-float-slow">
        🌸
      </span>
      <span className="pointer-events-none absolute bottom-32 left-6 text-2xl opacity-25 animate-float">
        💖
      </span>

      <div className="relative z-10 flex flex-col items-center px-6 w-full max-w-sm overflow-y-auto max-h-screen py-10 no-scrollbar fade-in">
        {/* Logo */}
        <div className="relative mb-3">
          <img
            src={ASSETS.LOGO}
            alt="Smilify"
            className="w-20 h-20 animate-bounce-gentle"
          />
          <Sparkles
            className="absolute -top-1 -right-2 text-primary animate-pulse-soft"
            size={18}
          />
        </div>

        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">
          Hello Pookie! 🎀
        </h1>
        <p className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-2 text-center">
          Join the worldwide smile movement ✨
        </p>
        <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed">
          Create your free account and start spreading happiness globally 🌍
        </p>

        {/* Form Card */}
        <div className="w-full bg-card rounded-3xl p-6 shadow-pookie border border-border space-y-4 mb-5">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Pookie Name ✨"
            className="w-full p-4 bg-muted/50 rounded-2xl font-bold border border-border outline-none text-sm placeholder:text-muted-foreground focus:border-primary transition-smooth"
            data-ocid="signup.name.input"
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email (cute only!) 💌"
            type="email"
            className="w-full p-4 bg-muted/50 rounded-2xl font-bold border border-border outline-none text-sm placeholder:text-muted-foreground focus:border-primary transition-smooth"
            data-ocid="signup.email.input"
          />
          <select
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="w-full p-4 bg-muted/50 rounded-2xl font-bold border border-border outline-none text-sm text-foreground focus:border-primary transition-smooth appearance-none"
            data-ocid="signup.country.select"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label
            className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl cursor-pointer active:bg-muted/70 border border-border transition-smooth"
            data-ocid="signup.human.checkbox"
          >
            <input
              type="checkbox"
              checked={form.isHuman}
              onChange={(e) => setForm({ ...form, isHuman: e.target.checked })}
              className="sr-only"
            />
            <div
              className={`w-6 h-6 rounded-xl border-2 flex-shrink-0 flex items-center justify-center transition-smooth ${
                form.isHuman
                  ? "bg-primary border-primary"
                  : "bg-card border-border"
              }`}
            >
              {form.isHuman && (
                <Check
                  size={14}
                  className="text-primary-foreground"
                  strokeWidth={3}
                />
              )}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              I'm a human pookie 🐼
            </span>
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 gradient-pink-rose text-primary-foreground rounded-[1.75rem] font-bold text-xs uppercase tracking-widest shadow-pookie-lg active:scale-95 transition-smooth disabled:opacity-60 flex items-center justify-center gap-2"
            data-ocid="signup.submit_button"
          >
            {isSubmitting ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              "Enter Wonderland 🌈"
            )}
          </button>
        </div>

        {/* Legal links */}
        <p className="text-xs text-muted-foreground text-center">
          By signing up you agree to our{" "}
          <button
            type="button"
            onClick={() => onNavigate("terms")}
            className="text-primary font-bold underline underline-offset-2"
            data-ocid="signup.terms.link"
          >
            Terms
          </button>{" "}
          &amp;{" "}
          <button
            type="button"
            onClick={() => onNavigate("privacy")}
            className="text-primary font-bold underline underline-offset-2"
            data-ocid="signup.privacy.link"
          >
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
}
