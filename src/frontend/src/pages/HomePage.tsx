import {
  ChevronRight,
  Globe,
  Heart,
  Info,
  ShoppingBag,
  Smile,
  Stars,
} from "lucide-react";
import type { UserProfile, View } from "../lib/types";

interface HomePageProps {
  profile: UserProfile | null;
  setView: (v: View) => void;
}

export function HomePage({ profile, setView }: HomePageProps) {
  const firstName = profile?.name?.split(" ")[0] ?? "Pookie";

  return (
    <div className="p-6 space-y-5 fade-in">
      {/* Greeting */}
      <div className="flex flex-col pt-2">
        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-1">
          Hey Pookie! ✨
        </span>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">
          {firstName}
        </h2>
      </div>

      {/* Hero CTA */}
      <button
        type="button"
        onClick={() => setView("camera")}
        className="w-full gradient-pink-rose rounded-[3rem] p-10 text-primary-foreground relative overflow-hidden shadow-pookie-lg active:scale-[0.98] transition-smooth text-left"
        data-ocid="home.post_smile.primary_button"
      >
        <div className="relative z-10">
          <h3 className="text-3xl font-bold mb-2 leading-tight">
            Post Your
            <br />
            Smile 🎀
          </h3>
          <p className="text-primary-foreground/80 text-[11px] font-bold mb-6 max-w-[180px] leading-relaxed">
            Share a moment of joy with the world pookie!
          </p>
          <span className="inline-block bg-card text-primary px-6 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-pookie">
            Start Capture
          </span>
        </div>
        <Smile
          size={200}
          className="absolute -bottom-10 -right-10 opacity-20 rotate-12 pointer-events-none"
        />
        <Stars
          size={40}
          className="absolute top-6 right-8 text-primary-foreground/40 pointer-events-none animate-pulse-soft"
        />
        <span className="absolute top-4 left-4 text-2xl opacity-30 animate-float pointer-events-none">
          ☁️
        </span>
      </button>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setView("shop")}
          className="bg-card p-8 rounded-[3rem] text-left border border-border shadow-xs hover:shadow-pookie transition-smooth group"
          data-ocid="home.shop.button"
        >
          <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-primary mb-4 group-active:scale-90 transition-smooth">
            <ShoppingBag size={22} />
          </div>
          <span className="font-bold text-xs block text-foreground">
            Sticker Shop
          </span>
          <span className="text-[10px] text-muted-foreground font-bold mt-0.5 block">
            Unlock cute stickers
          </span>
        </button>

        <button
          type="button"
          onClick={() => setView("wall")}
          className="bg-card p-8 rounded-[3rem] text-left border border-border shadow-xs hover:shadow-pookie transition-smooth group"
          data-ocid="home.wall.button"
        >
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400 mb-4 group-active:scale-90 transition-smooth">
            <Globe size={22} />
          </div>
          <span className="font-bold text-xs block text-foreground">
            Global Wall
          </span>
          <span className="text-[10px] text-muted-foreground font-bold mt-0.5 block">
            See all smiles
          </span>
        </button>
      </div>

      {/* Welfare Fund banner */}
      <button
        type="button"
        onClick={() => setView("welfare")}
        className="w-full rounded-[3rem] p-6 text-left relative overflow-hidden active:scale-[0.98] transition-smooth shadow-pookie-lg border border-transparent"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.88 0.14 65) 0%, oklch(0.92 0.12 45) 50%, oklch(0.88 0.10 25) 100%)",
        }}
        data-ocid="home.welfare.button"
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.75 0.20 55)" }}
          >
            <Heart size={22} className="fill-white text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-black text-xs block text-foreground">
              Welfare Fund 💛
            </span>
            <span
              className="text-[10px] font-bold mt-0.5 block leading-relaxed"
              style={{ color: "oklch(0.40 0.10 40)" }}
            >
              Stand with us against poverty & stress. Help bring smiles to kids
              in need.
            </span>
            <span
              className="inline-block mt-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white"
              style={{ background: "oklch(0.65 0.22 30)" }}
            >
              Donate Now →
            </span>
          </div>
        </div>
        <span className="absolute top-3 right-4 text-3xl opacity-30 pointer-events-none animate-float">
          🌟
        </span>
      </button>

      {/* About banner */}
      <button
        type="button"
        onClick={() => setView("info")}
        className="w-full bg-card p-6 rounded-[3rem] flex items-center justify-between border border-border shadow-xs hover:shadow-pookie transition-smooth active:scale-[0.98] group"
        data-ocid="home.about.button"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Info size={20} className="text-primary" />
          </div>
          <div className="text-left">
            <span className="font-bold text-xs block text-foreground">
              About Smilify
            </span>
            <span className="text-[10px] font-bold text-primary/60 block mt-0.5">
              Our Vision &amp; Mission
            </span>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-muted-foreground/50 flex-shrink-0"
        />
      </button>
    </div>
  );
}
