import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Heart, LogIn, Sparkles } from "lucide-react";
import { ASSETS } from "../lib/constants";
import type { View } from "../lib/types";

interface SignInPageProps {
  onNavigate: (view: View) => void;
}

export default function SignInPage({ onNavigate }: SignInPageProps) {
  const { login, loginStatus } = useInternetIdentity();
  const isLoading = loginStatus === "logging-in";

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 bg-primary blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15 bg-accent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 bg-primary blur-2xl" />
      </div>

      {/* Floating decorations */}
      <span className="pointer-events-none absolute top-16 left-8 text-3xl opacity-20 animate-float-slow">
        🌸
      </span>
      <span className="pointer-events-none absolute top-24 right-10 text-2xl opacity-25 animate-float">
        💖
      </span>
      <span className="pointer-events-none absolute bottom-40 left-6 text-3xl opacity-20 animate-float">
        ✨
      </span>
      <span className="pointer-events-none absolute bottom-28 right-8 text-2xl opacity-25 animate-float-slow">
        🌟
      </span>

      <div className="relative z-10 flex flex-col items-center px-8 w-full max-w-sm fade-in">
        {/* Logo + Brand */}
        <div className="relative mb-3">
          <img
            src={ASSETS.LOGO}
            alt="Smilify"
            className="w-24 h-24 animate-bounce-gentle drop-shadow-lg"
          />
          <Sparkles
            className="absolute -top-2 -right-3 text-primary animate-pulse-soft"
            size={22}
          />
        </div>

        <h1 className="text-4xl font-bold text-foreground tracking-tight mb-1">
          Smilify
        </h1>
        <p className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-2 text-center">
          Unifying everyone with just a smile 😊
        </p>
        <p className="text-sm text-muted-foreground text-center mb-10 leading-relaxed max-w-xs">
          Join millions spreading joy worldwide. Share your smile, earn tokens,
          and make the world happier. 🌍
        </p>

        {/* Sign In Card */}
        <div className="w-full bg-card rounded-3xl p-7 shadow-pookie border border-border mb-5">
          <h2 className="text-lg font-bold text-foreground text-center mb-1">
            Welcome back, Pookie! 🎀
          </h2>
          <p className="text-xs text-muted-foreground text-center mb-6">
            Sign in securely with Internet Identity
          </p>

          <button
            type="button"
            onClick={() => login()}
            disabled={isLoading}
            className="w-full py-4 gradient-pink-rose text-primary-foreground rounded-[1.75rem] font-bold text-sm uppercase tracking-widest shadow-pookie-lg active:scale-95 transition-smooth disabled:opacity-60 flex items-center justify-center gap-2.5"
            data-ocid="signin.submit_button"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                <span>Connecting…</span>
              </>
            ) : (
              <>
                <LogIn size={17} />
                <span>Sign In</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-bold">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={() => login()}
            disabled={isLoading}
            className="w-full py-4 bg-muted/60 border border-border text-foreground rounded-[1.75rem] font-bold text-sm uppercase tracking-widest active:scale-95 transition-smooth disabled:opacity-60 flex items-center justify-center gap-2.5"
            data-ocid="signup.link_button"
          >
            <Heart size={16} className="text-primary" />
            <span>New here? Create Account</span>
          </button>
        </div>

        {/* Legal links */}
        <p className="text-xs text-muted-foreground text-center">
          By signing in you agree to our{" "}
          <button
            type="button"
            onClick={() => onNavigate("terms")}
            className="text-primary font-bold underline underline-offset-2"
            data-ocid="signin.terms.link"
          >
            Terms
          </button>{" "}
          &amp;{" "}
          <button
            type="button"
            onClick={() => onNavigate("privacy")}
            className="text-primary font-bold underline underline-offset-2"
            data-ocid="signin.privacy.link"
          >
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
}
