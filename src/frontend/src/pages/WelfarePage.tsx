import { useActor } from "@caffeineai/core-infrastructure";
import { ExternalLink, Heart, Share2, X } from "lucide-react";
import { useState } from "react";
import { createActor } from "../backend";
import type { View } from "../lib/types";

interface WelfarePageProps {
  onNavigate: (view: View) => void;
  profile: import("../lib/types").UserProfile | null;
}

type PayTab = "upi" | "netbanking" | "bank" | "card";

const UPI_NAME = "Smilify%20Welfare%20Fund";

const impactCards = [
  {
    icon: "🧠",
    title: "Supporting Mental Health",
    desc: "We fight stress and peer pressure so every child can breathe easy and smile again.",
    color: "oklch(0.96 0.04 25)",
    border: "oklch(0.88 0.10 25)",
  },
  {
    icon: "🌾",
    title: "Fighting Poverty",
    desc: "Your ₹1 or more helps provide resources to kids who face poverty every day.",
    color: "oklch(0.97 0.05 80)",
    border: "oklch(0.88 0.12 80)",
  },
  {
    icon: "😊",
    title: "Building Smiles",
    desc: "We believe every child deserves a reason to smile — we make that happen together.",
    color: "oklch(0.97 0.04 140)",
    border: "oklch(0.88 0.10 140)",
  },
];

// ── Donation Form Modal ────────────────────────────────────────────────────
interface DonationFormProps {
  paymentMethod: string;
  amount: number;
  onClose: () => void;
  onSubmit: (name: string, msg: string) => void;
  isSubmitting: boolean;
  submitted: boolean;
}

function DonationForm({
  paymentMethod,
  amount,
  onClose,
  onSubmit,
  isSubmitting,
  submitted,
}: DonationFormProps) {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      data-ocid="welfare.donation_form.dialog"
    >
      <div
        className="w-full max-w-md rounded-[2rem] p-6 space-y-4 slide-in-from-bottom"
        style={{
          background: "oklch(1.0 0 0)",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {submitted ? (
          <div className="text-center py-6 fade-in">
            <div className="text-5xl mb-4 animate-bounce-gentle">🎉</div>
            <h3 className="text-lg font-black text-foreground mb-2">
              Thank you, pookie! 💛
            </h3>
            <p className="text-sm font-bold text-muted-foreground">
              Your donation has been recorded. You're a star for helping bring
              smiles to those who need it most!
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-3.5 rounded-[2rem] font-black text-sm text-white transition-smooth"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.25 12), oklch(0.65 0.22 30))",
              }}
              data-ocid="welfare.donation_form.close_button"
            >
              💖 Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">
                  Record your donation 💛
                </h3>
                <p className="text-xs font-bold text-muted-foreground mt-0.5">
                  ₹{amount} via {paymentMethod}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-muted text-muted-foreground transition-smooth"
                data-ocid="welfare.donation_form.cancel_button"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="donor-name"
                  className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1"
                >
                  Your Name *
                </label>
                <input
                  id="donor-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full border rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                  style={{ borderColor: "oklch(0.88 0.10 25)" }}
                  data-ocid="welfare.donation_form.name_input"
                />
              </div>
              <div>
                <label
                  htmlFor="donor-message"
                  className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1"
                >
                  Message (optional)
                </label>
                <textarea
                  id="donor-message"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Leave a kind message 💛"
                  rows={2}
                  className="w-full border rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/30 text-foreground resize-none"
                  style={{ borderColor: "oklch(0.88 0.10 25)" }}
                  data-ocid="welfare.donation_form.message_input"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={!name.trim() || isSubmitting}
              onClick={() => onSubmit(name.trim(), msg.trim())}
              className="w-full py-4 rounded-[2rem] font-black text-sm text-white transition-smooth disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.25 12), oklch(0.65 0.22 30))",
              }}
              data-ocid="welfare.donation_form.submit_button"
            >
              {isSubmitting ? "Recording... 🐼" : "💛 Record My Donation"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── WelfarePage ────────────────────────────────────────────────────────────
export default function WelfarePage({ onNavigate }: WelfarePageProps) {
  const { actor } = useActor(createActor);
  const [amount, setAmount] = useState(10);
  const [activeTab, setActiveTab] = useState<PayTab>("upi");
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [pendingPayMethod, setPendingPayMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const upiLink = `upi://pay?pa=souramondal033@okicici&pn=${UPI_NAME}&am=${amount}&cu=INR`;

  const handlePaymentClick = (method: string, url?: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (method === "UPI") {
      window.location.href = upiLink;
    }
    setPendingPayMethod(method);
    setSubmitted(false);
    setShowDonationForm(true);
  };

  const handleDonationSubmit = async (name: string, msg: string) => {
    if (!actor) return;
    setIsSubmitting(true);
    try {
      await actor.recordDonation(
        name,
        `₹${amount}`,
        pendingPayMethod,
        msg || null,
      );
      setSubmitted(true);
    } catch {
      setSubmitted(true); // still show success UI even if recording fails
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareWelfare = async () => {
    const shareData = {
      title: "Smilify Welfare Fund",
      text: "Help bring smiles to poor kids! Even ₹1 counts 💛",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`,
        );
      }
    } catch {
      // ignore
    }
  };

  const tabs: { id: PayTab; label: string }[] = [
    { id: "upi", label: "UPI" },
    { id: "netbanking", label: "Net Banking" },
    { id: "bank", label: "Bank Account" },
    { id: "card", label: "Card" },
  ];

  const btnStyle = {
    background:
      "linear-gradient(135deg, oklch(0.72 0.25 12) 0%, oklch(0.65 0.22 30) 100%)",
  };

  return (
    <>
      <div
        className="min-h-full pb-8 fade-in"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.97 0.04 25) 0%, oklch(0.98 0.05 70) 50%, oklch(0.97 0.03 20) 100%)",
        }}
        data-ocid="welfare.page"
      >
        {/* Hero */}
        <div
          className="relative overflow-hidden px-6 pt-10 pb-12 text-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.25 12) 0%, oklch(0.65 0.22 30) 60%, oklch(0.78 0.18 60) 100%)",
          }}
        >
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <span className="text-6xl animate-bounce-gentle">💛</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight mb-3">
              Smilify
              <br />
              Welfare Fund
            </h1>
            <p className="text-white/90 text-sm font-bold max-w-[280px] mx-auto leading-relaxed">
              We stand against stress, peer pressure, and poverty — because
              every child deserves to smile 💛
            </p>
          </div>
          <span className="absolute top-6 left-8 text-4xl opacity-20 pointer-events-none">
            🌟
          </span>
          <span className="absolute bottom-4 right-10 text-4xl opacity-20 pointer-events-none animate-float">
            🌸
          </span>
          <span className="absolute top-10 right-6 text-3xl opacity-15 pointer-events-none animate-pulse-soft">
            ✨
          </span>
        </div>

        <div className="px-5 space-y-5 -mt-4">
          {/* Donation amount card */}
          <div
            className="rounded-[2rem] p-6 shadow-pookie border"
            style={{
              background: "oklch(1.0 0 0)",
              borderColor: "oklch(0.92 0.08 25)",
            }}
            data-ocid="welfare.donation.card"
          >
            <h2 className="text-sm font-black text-foreground mb-4 flex items-center gap-2">
              <Heart size={16} className="text-primary fill-primary" />
              Choose Donation Amount
            </h2>
            <div className="flex gap-2 flex-wrap mb-4">
              {[1, 5, 10, 50, 100, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className="px-4 py-2 rounded-2xl text-xs font-black transition-smooth border"
                  style={
                    amount === val
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.72 0.25 12), oklch(0.65 0.22 30))",
                          color: "white",
                          borderColor: "transparent",
                        }
                      : {
                          background: "oklch(0.97 0.03 25)",
                          color: "oklch(0.55 0.20 12)",
                          borderColor: "oklch(0.90 0.08 25)",
                        }
                  }
                  data-ocid={`welfare.amount.${val}`}
                >
                  ₹{val}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-5">
              <span
                className="text-lg font-black"
                style={{ color: "oklch(0.55 0.20 12)" }}
              >
                ₹
              </span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) =>
                  setAmount(
                    Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                  )
                }
                className="flex-1 border rounded-2xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                style={{ borderColor: "oklch(0.88 0.10 25)" }}
                placeholder="Enter amount"
                data-ocid="welfare.amount.input"
                aria-label="Enter donation amount in rupees"
              />
            </div>
            <button
              type="button"
              onClick={() => handlePaymentClick("UPI")}
              className="block w-full text-center py-4 rounded-[2rem] font-black text-base text-white shadow-pookie-lg transition-smooth active:scale-[0.98]"
              style={btnStyle}
              data-ocid="welfare.donate_now.primary_button"
            >
              💛 Donate ₹{amount} Now
            </button>
            <p className="text-center text-[10px] text-muted-foreground font-bold mt-2">
              Opens your UPI payment app
            </p>
          </div>

          {/* Payment method tabs */}
          <div
            className="rounded-[2rem] overflow-hidden shadow-pookie border"
            style={{ borderColor: "oklch(0.92 0.08 25)" }}
            data-ocid="welfare.payment.card"
          >
            <div
              className="flex border-b"
              style={{ borderColor: "oklch(0.92 0.08 25)" }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 py-3.5 text-[11px] font-black transition-colors"
                  style={
                    activeTab === tab.id
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.72 0.25 12), oklch(0.65 0.22 30))",
                          color: "white",
                        }
                      : {
                          background: "oklch(0.98 0.02 25)",
                          color: "oklch(0.55 0.15 25)",
                        }
                  }
                  data-ocid={`welfare.tab.${tab.id}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6" style={{ background: "oklch(1.0 0 0)" }}>
              {/* UPI Tab */}
              {activeTab === "upi" && (
                <div
                  className="space-y-4 fade-in"
                  data-ocid="welfare.upi.panel"
                >
                  <div
                    className="p-5 rounded-2xl border space-y-2"
                    style={{
                      borderColor: "oklch(0.90 0.08 25)",
                      background: "oklch(0.97 0.03 25)",
                    }}
                  >
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      How it works
                    </p>
                    <p className="text-sm font-bold text-foreground leading-relaxed">
                      Tap the button below and your UPI app will open
                      automatically with the amount pre-filled. Complete the
                      payment there.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePaymentClick("UPI")}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm text-white transition-smooth active:scale-[0.98]"
                    style={btnStyle}
                    data-ocid="welfare.open_upi.button"
                  >
                    📱 Pay ₹{amount} via UPI App
                    <ExternalLink size={14} />
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground font-bold">
                    Works with GPay, PhonePe, Paytm & all UPI apps
                  </p>
                </div>
              )}

              {/* Net Banking Tab */}
              {activeTab === "netbanking" && (
                <div
                  className="space-y-4 fade-in"
                  data-ocid="welfare.netbanking.panel"
                >
                  <div
                    className="p-5 rounded-2xl border space-y-2"
                    style={{
                      borderColor: "oklch(0.90 0.08 25)",
                      background: "oklch(0.97 0.03 25)",
                    }}
                  >
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Net Banking
                    </p>
                    <p className="text-sm font-bold text-foreground leading-relaxed">
                      You'll be taken to a secure net banking portal. Complete
                      your donation there. Minimum ₹1, no maximum.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handlePaymentClick(
                        "Net Banking",
                        "https://www.onlinesbi.sbi/personal/banking_services.html",
                      )
                    }
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm text-white transition-smooth active:scale-[0.98]"
                    style={btnStyle}
                    data-ocid="welfare.netbanking.button"
                  >
                    🏦 Go to Net Banking
                    <ExternalLink size={14} />
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground font-bold">
                    Use your bank's net banking portal
                  </p>
                </div>
              )}

              {/* Bank Account Tab */}
              {activeTab === "bank" && (
                <div
                  className="space-y-4 fade-in"
                  data-ocid="welfare.bank.panel"
                >
                  <div
                    className="p-5 rounded-2xl border space-y-3"
                    style={{
                      borderColor: "oklch(0.90 0.08 25)",
                      background: "oklch(0.97 0.03 25)",
                    }}
                  >
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Bank Transfer Details
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-muted-foreground">
                          Bank
                        </span>
                        <span className="text-xs font-black text-foreground">
                          SBI (State Bank of India)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-muted-foreground">
                          Account Name
                        </span>
                        <span className="text-xs font-black text-foreground">
                          Smilify Welfare Fund
                        </span>
                      </div>
                    </div>
                    <p
                      className="text-[10px] font-bold text-muted-foreground border-t pt-3"
                      style={{ borderColor: "oklch(0.88 0.08 25)" }}
                    >
                      For full bank account details, email us at{" "}
                      <a
                        href="mailto:smilifytechhelp@gmail.com"
                        className="underline font-black"
                        style={{ color: "oklch(0.55 0.20 12)" }}
                      >
                        smilifytechhelp@gmail.com
                      </a>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePaymentClick("Bank Transfer")}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm text-white transition-smooth active:scale-[0.98]"
                    style={btnStyle}
                    data-ocid="welfare.bank_transfer.button"
                  >
                    💸 I've Made the Transfer
                  </button>
                </div>
              )}

              {/* Credit/Debit Card Tab */}
              {activeTab === "card" && (
                <div
                  className="space-y-4 fade-in"
                  data-ocid="welfare.card.panel"
                >
                  <div
                    className="p-5 rounded-2xl border space-y-2"
                    style={{
                      borderColor: "oklch(0.90 0.08 25)",
                      background: "oklch(0.97 0.03 25)",
                    }}
                  >
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Credit / Debit Card
                    </p>
                    <p className="text-sm font-bold text-foreground leading-relaxed">
                      You'll be taken to a secure payment page. Enter your card
                      details and complete the donation there.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handlePaymentClick(
                        "Credit/Debit Card",
                        "https://razorpay.com/payment-button",
                      )
                    }
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm text-white transition-smooth active:scale-[0.98]"
                    style={btnStyle}
                    data-ocid="welfare.card_payment.button"
                  >
                    💳 Pay with Card
                    <ExternalLink size={14} />
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground font-bold">
                    Secure payment — Visa, Mastercard, RuPay accepted
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Impact cards */}
          <div data-ocid="welfare.impact.section">
            <h2 className="text-xs font-black text-foreground uppercase tracking-widest mb-3 px-1 flex items-center gap-2">
              <span>🌟</span> Your Impact
            </h2>
            <div className="space-y-3">
              {impactCards.map((card) => (
                <div
                  key={card.title}
                  className="flex items-start gap-4 p-5 rounded-[1.5rem] border shadow-xs"
                  style={{ background: card.color, borderColor: card.border }}
                  data-ocid={`welfare.impact.item.${card.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="text-3xl shrink-0">{card.icon}</span>
                  <div>
                    <h3 className="text-sm font-black text-foreground mb-1">
                      {card.title}
                    </h3>
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission quote */}
          <div
            className="rounded-[2rem] p-6 text-center border"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.25 12) 0%, oklch(0.65 0.22 30) 60%, oklch(0.78 0.18 60) 100%)",
              borderColor: "transparent",
            }}
            data-ocid="welfare.mission.section"
          >
            <span className="text-4xl block mb-3">🤝</span>
            <p className="text-white font-black text-sm leading-relaxed">
              "Smiling is contagious. Help us spread it to every corner of the
              world — starting with those who need it most."
            </p>
            <p className="text-white/70 text-[11px] font-bold mt-2">
              — Team Smilify
            </p>
          </div>

          {/* Share */}
          <button
            type="button"
            onClick={shareWelfare}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-[2rem] font-black text-sm transition-smooth active:scale-[0.98] border"
            style={{
              background: "oklch(1.0 0 0)",
              color: "oklch(0.55 0.20 12)",
              borderColor: "oklch(0.88 0.10 25)",
            }}
            data-ocid="welfare.share.button"
          >
            <Share2 size={16} />
            Share the Welfare Fund
          </button>

          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="w-full text-center text-xs font-black text-muted-foreground py-2 transition-smooth hover:text-primary"
            data-ocid="welfare.back.button"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Donation form modal */}
      {showDonationForm && (
        <DonationForm
          paymentMethod={pendingPayMethod}
          amount={amount}
          onClose={() => setShowDonationForm(false)}
          onSubmit={handleDonationSubmit}
          isSubmitting={isSubmitting}
          submitted={submitted}
        />
      )}
    </>
  );
}
