import {
  Check,
  Flower2,
  HandHeart,
  Heart,
  Mail,
  Sparkles,
  Stars,
} from "lucide-react";
import { ASSETS } from "../lib/constants";

// ── Sub-component ──────────────────────────────────────────────────────────
interface PookieFounderProps {
  img: string;
  name: string;
  jobTitle: string;
  quote: string;
  reverse?: boolean;
}

function PookieFounder({
  img,
  name,
  jobTitle,
  quote,
  reverse = false,
}: PookieFounderProps) {
  return (
    <div
      className={`flex items-center gap-6 p-6 bg-card rounded-[3.5rem] border border-border shadow-sm hover:shadow-pookie transition-smooth group relative overflow-hidden ${
        reverse ? "flex-row-reverse text-right" : ""
      }`}
    >
      {/* Decorative bg blob */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-32 h-32 bg-primary rounded-full blur-3xl absolute -top-8 -right-8" />
      </div>

      {/* Photo */}
      <div className="shrink-0 relative">
        <img
          src={img}
          alt={name}
          className="w-24 h-24 rounded-[2.5rem] object-cover border-4 border-muted transition-transform group-hover:scale-105 duration-500"
        />
        <div
          className={`absolute -bottom-1 w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-pookie ${
            reverse ? "-left-1" : "-right-1"
          }`}
        >
          <Heart size={14} className="fill-current" />
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-lg text-foreground leading-tight truncate">
          {name}
        </h4>
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
          {jobTitle}
        </p>
        <p className="text-[11px] font-bold text-muted-foreground italic leading-snug mt-3 px-1 line-clamp-3">
          "{quote}"
        </p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AboutPage() {
  const missionItems = [
    "Take a moment to smile every day",
    "Spread positivity across borders",
    "Connect through simple joy",
  ];

  return (
    <div className="p-6 space-y-12 pb-48 fade-in" data-ocid="about.page">
      {/* 1 ── HERO */}
      <section
        className="text-center pt-8 relative"
        data-ocid="about.hero.section"
      >
        <Flower2
          className="absolute top-0 left-4 text-primary/20 animate-float-slow pointer-events-none"
          size={40}
        />
        <Flower2
          className="absolute top-10 right-4 text-primary/15 animate-float pointer-events-none"
          size={30}
        />

        <div className="relative inline-block">
          <img
            src={ASSETS.LOGO}
            alt="Smilify logo"
            className="w-24 h-24 mx-auto mb-6 drop-shadow-2xl animate-float-slow"
          />
          <div className="absolute -top-2 -right-4 bg-primary text-primary-foreground p-2 rounded-full animate-bounce shadow-pookie">
            <Sparkles size={16} />
          </div>
        </div>

        <h2 className="text-4xl font-bold tracking-tight text-foreground">
          About Smilify
        </h2>
        <p className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] mt-3">
          Spreading Joy Worldwide 🌎✨
        </p>
      </section>

      {/* 2 ── MISSION CARD */}
      <section
        className="bg-card p-10 rounded-[3.5rem] shadow-pookie-lg border border-border relative overflow-hidden"
        data-ocid="about.mission.card"
      >
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <HandHeart size={80} className="text-primary" />
        </div>

        <p className="text-sm font-bold text-foreground/80 leading-relaxed italic text-center mb-8">
          "Smilify is a global digital platform created to spread happiness
          through the power of a simple smile." 🎀
        </p>

        <div className="space-y-6 text-[12px] font-bold text-muted-foreground leading-relaxed">
          <p>
            It is a unique website where people from all around the world can
            take a live selfie while smiling and share that positive moment with
            a global community.
          </p>
          <div className="bg-primary/8 p-6 rounded-[2.5rem] border border-primary/15">
            <p className="text-primary/90">
              Every smile captured on Smilify becomes part of a worldwide
              movement to encourage positivity and emotional well-being. Post to
              earn <span className="text-primary font-bold">Smile Tokens</span>{" "}
              pookie! 💎✨
            </p>
          </div>
        </div>
      </section>

      {/* 3 ── VISION IMAGE */}
      <section
        className="relative rounded-[3.5rem] overflow-hidden shadow-pookie-lg border-[6px] border-card group"
        data-ocid="about.vision.section"
      >
        <img
          src={ASSETS.VISION_IMG}
          alt="Smilify vision"
          className="w-full aspect-[4/5] object-cover transition-transform duration-[2s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent flex flex-col justify-end p-10">
          <h3 className="text-primary-foreground text-2xl font-bold mb-2">
            Why Smilify? 🐼
          </h3>
          <p className="text-primary-foreground/90 text-[11px] font-bold leading-relaxed">
            In today's fast-paced world, many experience stress and loneliness.
            A smile may seem small, but it's a powerful spark of light.
          </p>
        </div>
      </section>

      {/* 4 ── MISSION LIST */}
      <section
        className="bg-foreground p-10 rounded-[4rem] text-background space-y-8 shadow-pookie-lg relative overflow-hidden"
        data-ocid="about.mission-list.section"
      >
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center rotate-12 shadow-pookie-lg">
          <Stars size={24} className="text-primary-foreground" />
        </div>
        <h3 className="text-xl font-bold text-primary">Our Pookie Mission</h3>
        <div className="space-y-6">
          {missionItems.map((item, i) => (
            <div
              key={item}
              className="flex gap-4 items-center"
              data-ocid={`about.mission.item.${i + 1}`}
            >
              <div className="w-10 h-10 rounded-2xl bg-background/10 flex items-center justify-center shrink-0 border border-background/10">
                <Check size={16} className="text-primary" />
              </div>
              <p className="text-xs font-bold text-background/80">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5 ── VISION QUOTE */}
      <section
        className="text-center py-6 px-4 space-y-4"
        data-ocid="about.vision-quote.section"
      >
        <HandHeart className="mx-auto text-primary/30" size={32} />
        <h4 className="text-primary text-[10px] font-bold uppercase tracking-widest">
          Our Vision
        </h4>
        <p className="text-xl font-bold text-foreground leading-snug italic">
          "To create a world where smiles are shared freely, positivity is
          rewarded, and happiness becomes a global language." 🌈
        </p>
      </section>

      {/* 6 ── FOUNDERS */}
      <section className="space-y-8" data-ocid="about.founders.section">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground">
            The Musketeers 💖
          </h3>
          <p className="text-[11px] font-bold text-primary mt-2">
            1st Year B.Tech Biotech @ Adamas University
          </p>
        </div>

        <div className="space-y-6">
          <PookieFounder
            img={ASSETS.FOUNDERS.SOURADIPTA}
            name="Souradipta Mondal"
            jobTitle="Founder & CEO"
            quote="A simple smile has the power to change someone's day. Smilify connects the world through happiness."
          />
          <PookieFounder
            img={ASSETS.FOUNDERS.SOUVIK}
            name="Souvik Das"
            jobTitle="Co-Founder & CTO"
            quote="Technology should not only solve problems but also spread joy. Smilify is our step towards happiness."
            reverse
          />
          <PookieFounder
            img={ASSETS.FOUNDERS.SAMPURNA}
            name="Sampurna Chandra"
            jobTitle="Co-Founder & CCO"
            quote="A smile is a universal language. We want positivity to travel beyond borders pookie! ✨"
          />
        </div>
      </section>

      {/* 7 ── TEAM PHILOSOPHY */}
      <section
        className="bg-primary p-10 rounded-[3.5rem] text-primary-foreground text-center space-y-4 shadow-pookie-lg"
        data-ocid="about.philosophy.card"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
          Team Philosophy ✨
        </p>
        <p className="text-lg font-bold italic">
          "Three students, one idea, and a mission to make the world smile."
        </p>
        <p className="text-xs font-bold opacity-70">
          "If one smile can brighten a moment, millions can brighten the world."
        </p>
      </section>

      {/* 8 ── CONTACT / HELP */}
      <section
        className="bg-card p-10 rounded-[3.5rem] border-2 border-border text-center space-y-6"
        data-ocid="about.contact.section"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary mx-auto shadow-pookie">
          <Mail size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Help &amp; Feedback
          </h3>
          <p className="text-[11px] font-bold text-muted-foreground mt-2 px-6">
            We love hearing from our pookies! Reach out anytime.
          </p>
        </div>
        <a
          href="mailto:smilifytechhelp@gmail.com"
          className="inline-block px-8 py-3 bg-foreground text-background rounded-full font-bold text-[11px] tracking-widest active:scale-95 transition-smooth hover:opacity-90"
          data-ocid="about.contact.link"
        >
          smilifytechhelp@gmail.com
        </a>
      </section>

      {/* 9 ── FOOTER */}
      <footer
        className="text-center pt-8 pb-4"
        data-ocid="about.footer.section"
      >
        <h4 className="text-xl font-bold text-foreground tracking-tight">
          Smilify®
        </h4>
        <p className="text-[11px] font-bold text-primary/60 mt-2 leading-relaxed">
          Made by Souradipta, Souvik and Sampurna
          <br />
          (The Three Musketeers 💖)
        </p>
      </footer>
    </div>
  );
}
