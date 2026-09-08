import { useActor } from "@caffeineai/core-infrastructure";
import { RefreshCw, Zap } from "lucide-react";
import { useState } from "react";
import { createActor } from "../backend";
import { ALL_STICKERS } from "../lib/constants";
import type { UserProfile, View } from "../lib/types";

interface ShopPageProps {
  profile: UserProfile | null;
  setView: (v: View) => void;
  onToast: (msg: string) => void;
}

export function ShopPage({ profile, onToast }: ShopPageProps) {
  const { actor } = useActor(createActor);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  // Local unlocked set so UI updates instantly after claim/buy
  const [localUnlocked, setLocalUnlocked] = useState<Set<string>>(
    () => new Set(profile?.unlockedStickers ?? []),
  );

  const handleBuy = async (stickerId: string, cost: number) => {
    if (!profile) return onToast("Sign in to get stickers pookie! 🎀");
    if (cost > 0 && profile.tokens < cost)
      return onToast("Earn more tokens first pookie! 💎");
    if (!actor) return onToast("Connecting... try again pookie! 🐼");
    if (purchasing) return;

    setPurchasing(stickerId);
    try {
      const result = await actor.buySticker(stickerId, BigInt(cost));
      if (result.__kind__ === "ok") {
        setLocalUnlocked((prev) => new Set([...prev, stickerId]));
        onToast(
          cost === 0
            ? "Free sticker claimed pookie! 🎁✨"
            : "Sticker unlocked pookie! ✨",
        );
      } else {
        onToast(`Oops! ${result.err} 💖`);
      }
    } catch {
      onToast("Something went wrong pookie! Try again 🐼");
    } finally {
      setPurchasing(null);
    }
  };

  const unlockedSet = localUnlocked;

  return (
    <div className="p-6 fade-in">
      {/* Header */}
      <div className="flex flex-col mb-8 pt-2">
        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-1">
          Pookie Boutique ✨
        </span>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Cute Stickers
        </h2>
      </div>

      {/* Sticker Grid */}
      <div className="grid grid-cols-2 gap-4">
        {ALL_STICKERS.map((sticker) => {
          const isUnlocked = unlockedSet.has(sticker.id);
          const isBuying = purchasing === sticker.id;

          return (
            <div
              key={sticker.id}
              className="bg-card p-8 rounded-[3rem] border border-border text-center shadow-xs hover:shadow-pookie transition-smooth relative overflow-hidden group"
              data-ocid={`shop.sticker.${sticker.id}.card`}
            >
              {/* Decorative glow */}
              {isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-[3rem]" />
              )}

              {/* Emoji */}
              <div className="text-5xl mb-5 transform group-hover:scale-110 transition-smooth leading-none">
                {sticker.emoji}
              </div>

              {/* Label */}
              <p className="font-bold text-[10px] text-primary/60 uppercase tracking-widest mb-5">
                {sticker.label}
              </p>

              {/* Action */}
              {isUnlocked && sticker.cost === 0 ? (
                <div
                  className="py-3 bg-emerald-500/15 rounded-2xl text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest"
                  data-ocid={`shop.sticker.${sticker.id}.unlocked`}
                >
                  Claimed ✓
                </div>
              ) : isUnlocked ? (
                <div
                  className="py-3 bg-muted rounded-2xl text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                  data-ocid={`shop.sticker.${sticker.id}.unlocked`}
                >
                  Unlocked ✨
                </div>
              ) : sticker.cost === 0 ? (
                <button
                  type="button"
                  onClick={() => handleBuy(sticker.id, 0)}
                  disabled={isBuying || !actor}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-pookie active:scale-95 transition-smooth disabled:opacity-60"
                  data-ocid={`shop.sticker.${sticker.id}.claim_button`}
                >
                  {isBuying ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <>
                      <span>🎁</span>
                      <span>Claim Free!</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleBuy(sticker.id, sticker.cost)}
                  disabled={isBuying || !actor}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-pookie active:scale-95 transition-smooth disabled:opacity-60"
                  data-ocid={`shop.sticker.${sticker.id}.buy_button`}
                >
                  {isBuying ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <>
                      <Zap size={11} className="fill-current" />
                      <span>{sticker.cost}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Token reminder */}
      <div className="mt-8 p-6 bg-card rounded-[2.5rem] border border-border flex items-center justify-between shadow-xs">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Your Balance
          </p>
          <p className="text-xl font-bold text-foreground mt-0.5">
            {profile?.tokens ?? 0}{" "}
            <span className="text-sm text-primary font-bold">Tokens</span>
          </p>
        </div>
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-pookie">
          <Zap size={22} className="text-primary-foreground fill-current" />
        </div>
      </div>

      <p className="text-center text-[10px] font-bold text-muted-foreground mt-4 pb-2">
        Post a smile to earn +10 tokens pookie! 🎀
      </p>
    </div>
  );
}
