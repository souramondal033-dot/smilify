import { ArrowLeft, Heart } from "lucide-react";
import { ASSETS } from "../lib/constants";
import type { View } from "../lib/types";

interface PrivacyPageProps {
  onNavigate: (view: View) => void;
}

const SECTIONS = [
  {
    emoji: "📋",
    title: "What We Collect",
    content:
      "When you register, we collect your display name, email address, and country. When you post smiles, we store your photos, token balance, sticker inventory, and posting activity (like streaks and dates). We also store your account preferences such as cookie consent.",
  },
  {
    emoji: "💡",
    title: "How We Use It",
    content:
      "Your information is used to operate the Smilify platform: showing your smiles on the global wall, maintaining your token balance, tracking posting streaks, awarding achievement badges, and moderating content to keep the community safe. We do not use your data for advertising.",
  },
  {
    emoji: "🤝",
    title: "Sharing Your Data",
    content:
      "We do not sell your personal information to any third party. Your name and country may be shown publicly alongside your posted smiles on the global wall. Your email is kept private and never shared or displayed publicly. We do not share data with advertisers or data brokers.",
  },
  {
    emoji: "⏳",
    title: "Data Retention",
    content:
      "Your data is retained for as long as your account is active. Smiles you post remain on the global wall until you or an admin deletes them. If you choose to stop using Smilify, your data remains stored on the decentralised Internet Computer platform.",
  },
  {
    emoji: "⚖️",
    title: "Your Rights",
    content:
      "You have the right to request deletion of your content at any time by deleting individual smile posts from your profile. For account deletion or data inquiries, contact us at smilifytechhelp@gmail.com. We'll process your request within 7 business days.",
  },
  {
    emoji: "🔒",
    title: "Security",
    content:
      "Smilify runs on the Internet Computer, a decentralised blockchain platform. Authentication is handled by Internet Identity, a privacy-preserving, passwordless identity system. We never store passwords and cannot access your cryptographic keys.",
  },
  {
    emoji: "🍪",
    title: "Cookies",
    content:
      "We use minimal cookies and local storage to remember your session preferences, such as your cookie consent choice. We do not use tracking or advertising cookies. You can decline cookie consent and still use the core features of Smilify.",
  },
  {
    emoji: "📧",
    title: "Contact Us",
    content:
      "For any privacy-related questions, requests, or concerns, please reach out to us at smilifytechhelp@gmail.com. We take your privacy seriously and respond to all inquiries within 24–48 hours 💖",
  },
];

export default function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Pink header */}
      <div className="gradient-pink-rose px-5 pt-12 pb-10 text-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-primary-foreground/10 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-primary-foreground/10 blur-2xl" />
        </div>
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="absolute top-5 left-5 w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground active:scale-90 transition-smooth"
          aria-label="Go back"
          data-ocid="privacy.back.button"
        >
          <ArrowLeft size={18} />
        </button>
        <img
          src={ASSETS.LOGO}
          alt="Smilify"
          className="w-16 h-16 mx-auto mb-3"
        />
        <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">
          Privacy Policy
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
            onClick={() => onNavigate("terms")}
            className="mt-3 text-xs text-primary font-bold underline underline-offset-2"
            data-ocid="privacy.terms.link"
          >
            View Terms of Service →
          </button>
        </div>
      </div>
    </div>
  );
}
