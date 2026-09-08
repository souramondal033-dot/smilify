import { ALL_STICKERS } from "@/lib/constants";
import type { PlacedSticker, UserProfile } from "@/lib/types";
import {
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useCallback, useRef } from "react";

interface EditorPageProps {
  editingImage: string;
  placedStickers: PlacedSticker[];
  setPlacedStickers: React.Dispatch<React.SetStateAction<PlacedSticker[]>>;
  activeStickerId: number | null;
  setActiveStickerId: React.Dispatch<React.SetStateAction<number | null>>;
  profile: UserProfile;
  onPublish: () => void;
  onRetry: () => void;
  isPublishing: boolean;
}

export default function EditorPage({
  editingImage,
  placedStickers,
  setPlacedStickers,
  activeStickerId,
  setActiveStickerId,
  profile,
  onPublish,
  onRetry,
  isPublishing,
}: EditorPageProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{
    id: number;
    startX: number;
    startY: number;
  } | null>(null);

  const activeSticker =
    placedStickers.find((s) => s.id === activeStickerId) ?? null;

  const addSticker = (stickerEmoji: string) => {
    const newId = Date.now();
    setPlacedStickers((prev) => [
      ...prev,
      { id: newId, emoji: stickerEmoji, x: 0.5, y: 0.5, scale: 1, rotation: 0 },
    ]);
    setActiveStickerId(newId);
  };

  const deleteActiveSticker = () => {
    setPlacedStickers((prev) => prev.filter((s) => s.id !== activeStickerId));
    setActiveStickerId(null);
  };

  const updateActive = (patch: Partial<PlacedSticker>) => {
    setPlacedStickers((prev) =>
      prev.map((s) => (s.id === activeStickerId ? { ...s, ...patch } : s)),
    );
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const getRelativePos = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) / rect.width,
        y: (clientY - rect.top) / rect.height,
      };
    },
    [],
  );

  const onStickerMouseDown = useCallback(
    (e: React.MouseEvent, id: number) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveStickerId(id);
      draggingRef.current = { id, startX: e.clientX, startY: e.clientY };
    },
    [setActiveStickerId],
  );

  const onStickerTouchStart = useCallback(
    (e: React.TouchEvent, id: number) => {
      e.stopPropagation();
      setActiveStickerId(id);
      const touch = e.touches[0];
      if (touch) {
        draggingRef.current = {
          id,
          startX: touch.clientX,
          startY: touch.clientY,
        };
      }
    },
    [setActiveStickerId],
  );

  const onCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingRef.current) return;
      const pos = getRelativePos(e.clientX, e.clientY);
      if (!pos) return;
      const { id } = draggingRef.current;
      setPlacedStickers((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                x: Math.min(1, Math.max(0, pos.x)),
                y: Math.min(1, Math.max(0, pos.y)),
              }
            : s,
        ),
      );
    },
    [getRelativePos, setPlacedStickers],
  );

  const onCanvasTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const pos = getRelativePos(touch.clientX, touch.clientY);
      if (!pos) return;
      const { id } = draggingRef.current;
      setPlacedStickers((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                x: Math.min(1, Math.max(0, pos.x)),
                y: Math.min(1, Math.max(0, pos.y)),
              }
            : s,
        ),
      );
    },
    [getRelativePos, setPlacedStickers],
  );

  const stopDragging = useCallback(() => {
    draggingRef.current = null;
  }, []);

  // Always include free stickers (cost === 0) + any paid stickers the user has unlocked
  const unlockedDefs = ALL_STICKERS.filter(
    (s) => s.cost === 0 || profile.unlockedStickers.includes(s.id),
  );

  return (
    <div
      className="fixed inset-0 z-[600] bg-slate-900 flex flex-col"
      data-ocid="editor.page"
    >
      {/* ── Canvas area ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-5 overflow-hidden">
        <div
          ref={canvasRef}
          className="relative w-full max-w-md aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-2 border-white/5 touch-none"
          data-ocid="editor.canvas_target"
          onMouseMove={onCanvasMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          onTouchMove={onCanvasTouchMove}
          onTouchEnd={stopDragging}
          onTouchCancel={stopDragging}
        >
          {/* Full-area deselect button behind stickers */}
          <button
            type="button"
            aria-label="Deselect sticker"
            onMouseDown={(e) => {
              // Only deselect if not dragging a sticker
              if (!draggingRef.current) {
                e.stopPropagation();
                setActiveStickerId(null);
              }
            }}
            onClick={() => {
              if (!draggingRef.current) setActiveStickerId(null);
            }}
            className="absolute inset-0 w-full h-full z-0 cursor-pointer focus:outline-none"
          />
          <img
            src={editingImage}
            alt="Your smile"
            className="absolute inset-0 w-full h-full object-cover z-[1] pointer-events-none"
            draggable={false}
          />

          {/* Placed sticker overlays */}
          {placedStickers.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Sticker ${s.emoji} — drag to move`}
              className={[
                "absolute select-none leading-none z-[2] cursor-grab active:cursor-grabbing",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                "border-none bg-transparent p-0",
                activeStickerId === s.id
                  ? "ring-4 ring-primary rounded-full bg-white/10 shadow-pookie-lg"
                  : "",
              ].join(" ")}
              style={{
                left: `${s.x * 100}%`,
                top: `${s.y * 100}%`,
                transform: `translate(-50%, -50%) rotate(${s.rotation}deg) scale(${s.scale})`,
                fontSize: "88px",
                lineHeight: 1,
                touchAction: "none",
              }}
              onMouseDown={(e) => onStickerMouseDown(e, s.id)}
              onTouchStart={(e) => onStickerTouchStart(e, s.id)}
              onClick={(e) => {
                e.stopPropagation();
                setActiveStickerId(s.id);
              }}
              data-ocid={`editor.sticker.${idx + 1}`}
            >
              {s.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bottom panel ─────────────────────────────────────────── */}
      <div className="bg-card rounded-t-[4rem] px-8 pt-8 pb-10 shadow-2xl z-[700] slide-in-from-bottom">
        {activeSticker ? (
          /* ── Edit selected sticker ───────────────────────── */
          <div className="space-y-6" data-ocid="editor.sticker_edit.panel">
            {/* Header */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase">
                Edit Sticker {activeSticker.emoji}
              </span>
              <button
                type="button"
                onClick={deleteActiveSticker}
                className="p-3 bg-destructive/10 text-destructive rounded-2xl active:scale-90 transition-smooth hover:bg-destructive/20"
                aria-label="Delete sticker"
                data-ocid="editor.delete_button"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Size + Spin controls */}
            <div className="grid grid-cols-2 gap-4">
              {/* Size */}
              <div className="bg-muted/60 p-4 rounded-3xl flex justify-around items-center border border-border">
                <button
                  type="button"
                  onClick={() =>
                    updateActive({
                      scale: Math.max(0.2, (activeSticker.scale ?? 1) - 0.15),
                    })
                  }
                  className="w-12 h-12 bg-card rounded-2xl shadow-xs flex items-center justify-center active:scale-90 transition-smooth hover:shadow-pookie"
                  aria-label="Shrink sticker"
                  data-ocid="editor.size_minus.button"
                >
                  <Minus size={18} className="text-foreground" />
                </button>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Size
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateActive({
                      scale: Math.min(5, (activeSticker.scale ?? 1) + 0.15),
                    })
                  }
                  className="w-12 h-12 bg-card rounded-2xl shadow-xs flex items-center justify-center active:scale-90 transition-smooth hover:shadow-pookie"
                  aria-label="Grow sticker"
                  data-ocid="editor.size_plus.button"
                >
                  <Plus size={18} className="text-foreground" />
                </button>
              </div>

              {/* Spin */}
              <div className="bg-muted/60 p-4 rounded-3xl flex justify-around items-center border border-border">
                <button
                  type="button"
                  onClick={() =>
                    updateActive({
                      rotation: (activeSticker.rotation ?? 0) - 15,
                    })
                  }
                  className="w-12 h-12 bg-card rounded-2xl shadow-xs flex items-center justify-center active:scale-90 transition-smooth hover:shadow-pookie"
                  aria-label="Rotate counter-clockwise"
                  data-ocid="editor.rotate_ccw.button"
                >
                  <RotateCcw size={18} className="text-foreground" />
                </button>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Spin
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateActive({
                      rotation: (activeSticker.rotation ?? 0) + 15,
                    })
                  }
                  className="w-12 h-12 bg-card rounded-2xl shadow-xs flex items-center justify-center active:scale-90 transition-smooth hover:shadow-pookie"
                  aria-label="Rotate clockwise"
                  data-ocid="editor.rotate_cw.button"
                >
                  <RotateCw size={18} className="text-foreground" />
                </button>
              </div>
            </div>

            {/* Done */}
            <button
              type="button"
              onClick={() => setActiveStickerId(null)}
              className="w-full py-5 gradient-pink-rose text-primary-foreground rounded-[2rem] font-bold text-[11px] uppercase tracking-[0.2em] shadow-pookie-lg active:scale-95 transition-smooth"
              data-ocid="editor.done_button"
            >
              Done Pookie! 🎀
            </button>
          </div>
        ) : (
          /* ── Default panel — sticker picker + actions ─────── */
          <div className="space-y-6">
            {/* Hint */}
            <p className="text-center text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
              Tap a sticker to add · Drag stickers to move 🎀
            </p>

            {/* Unlocked sticker picker */}
            <div
              className="flex gap-3 overflow-x-auto pb-2 no-scrollbar"
              data-ocid="editor.sticker_picker"
            >
              {unlockedDefs.length === 0 ? (
                <p className="text-muted-foreground text-xs font-bold px-1 py-3 shrink-0">
                  No stickers yet — visit the shop pookie! 🛍️
                </p>
              ) : (
                unlockedDefs.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => addSticker(s.emoji)}
                    className="w-16 h-16 bg-muted/60 rounded-[1.8rem] shrink-0 text-3xl flex items-center justify-center border-2 border-border active:scale-90 transition-smooth hover:border-primary/40 hover:shadow-pookie"
                    aria-label={`Add ${s.label} sticker`}
                    data-ocid={`editor.add_sticker.${s.id}`}
                  >
                    {s.emoji}
                  </button>
                ))
              )}
            </div>

            {/* Retry / Publish */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={onRetry}
                className="py-6 bg-muted text-muted-foreground rounded-[2rem] font-bold text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-smooth hover:bg-muted/80 border border-border"
                data-ocid="editor.retry_button"
              >
                Retry 📷
              </button>
              <button
                type="button"
                onClick={onPublish}
                disabled={isPublishing}
                className="py-6 gradient-pink-rose text-primary-foreground rounded-[2rem] font-bold text-[11px] uppercase tracking-[0.2em] shadow-pookie-lg active:scale-95 transition-smooth flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                data-ocid="editor.publish_button"
              >
                {isPublishing ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <>
                    <Sparkles size={15} />
                    Publish 🐼
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
