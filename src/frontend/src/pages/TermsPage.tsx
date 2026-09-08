import { ArrowLeft, Heart } from "lucide-react";
import { ASSETS } from "../lib/constants";
import type { View } from "../lib/types";

interface TermsPageProps {
  onNavigate: (view: View) => void;
}

const SECTIONS = [
  {
    emoji: "👋",
    title: "Welcome to Smilify",
    content:
      "Welcome pookie! By using Smilify, you agree to these terms. We've written them in plain language because legalese is not our vibe. Smilify is a global platform for sharing smiles and spreading happiness. These terms help keep the community safe and joyful for everyone.",
  },
  {
    emoji: "✅",
    title: "What You Can Do",
    content:
      "You can post selfies of yourself smiling to the global wall, earn Smile Tokens for each post, use tokens to unlock fun stickers in the Pookie Boutique, decorate your photos with your unlocked stickers, like and enjoy other people's smiles, and build posting streaks to earn achievement badges.",
  },
  {
    emoji: "🚫",
    title: "What You Must Not Do",
    content:
      "Please do not post offensive, harmful, or inappropriate content. Do not impersonate other users or create fake accounts. Do not spam the global wall with repetitive content. Do not attempt to exploit or hack the platform. Do not use Smilify to harass or bully other users. Violations may result in immediate account termination.",
  },
  {
    emoji: "🛡️",
    title: "Content Moderation",
    content:
      "Smilify admins monitor the global wall to keep it a safe, positive space. We reserve the right to delete any content that violates these terms without prior notice. If you see something concerning, please contact us at smilifytechhelp@gmail.com and we'll address it promptly.",
  },
  {
    emoji: "⚠️",
    title: "Account Termination",
    content:
      "We reserve the right to suspend or terminate accounts that violate these terms. If your account is terminated, your tokens, stickers, and posted content may be permanently removed. We'll always try to give a warning first unless the violation is severe.",
  },
  {
    emoji: "✨",
    title: "Tokens & Virtual Items",
    content:
      "Smile Tokens and stickers are virtual items with no real-world monetary value. They cannot be transferred, exchanged, or sold for real money. Token balances and unlocked stickers are tied to your account and may be reset in case of serious violations.",
  },
  {
    emoji: "📧",
    title: "Contact Us",
    content:
      "Have questions about these terms? We're always here to help! Reach us at smilifytechhelp@gmail.com. We typically respond within 24 hours because your happiness matters to us 💖",
  },
];

export default function TermsPage({ onNavigate }: TermsPageProps) {
  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Pink header */}
      <div className="gradient-pink-rose px-5 pt-12 pb-10 text-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary-foreground/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-primary-foreground/10 blur-2xl" />
        </div>
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="absolute top-5 left-5 w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground active:scale-90 transition-smooth"
          aria-label="Go back"
          data-ocid="terms.back.button"
        >
          <ArrowLeft size={18} />
        </button>
        <img
          src={ASSETS.LOGO}
          alt="Smilify"
          className="w-16 h-16 mx-auto mb-3"
        />
        <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">
          Terms of Service
        </h1>
        <p className="text-primary-foreground/80 text-xs mt-1">
          Last updated: April 2026
        </p>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-5 pt-8 space-y-6">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="bg-card rounded-3xl p-6 shadow-pookie border border-border"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{section.emoji}</span>
              <h2 className="font-bold text-foreground text-base">
                {section.title}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}

        {/* Footer */}
        <div className="text-center py-6">
          <Heart size={20} className="text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Made with love by the Smilify team 🎀
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            smilifytechhelp@gmail.com
          </p>
          <button
            type="button"
            onClick={() => onNavigate("privacy")}
            className="mt-3 text-xs text-primary font-bold underline underline-offset-2"
            data-ocid="terms.privacy.link"
          >
            View Privacy Policy →
          </button>
        </div>
      </div>
    </div>
  );
}
