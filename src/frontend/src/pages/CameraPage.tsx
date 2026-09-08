import { FlipHorizontal2, ImagePlus, Smile, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CameraPageProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

type FacingMode = "user" | "environment";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ─── CropModal ────────────────────────────────────────────────────────────────
interface CropModalProps {
  imageSrc: string;
  onCrop: (croppedDataUrl: string) => void;
  onSkip: () => void;
}

function CropModal({ imageSrc, onCrop, onSkip }: CropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const cropRef = useRef<CropRect>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const _overlayRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState(0);

  // Drag / resize state (all in fraction of displayed image size)
  const dragState = useRef<{
    type: "move" | "tl" | "tr" | "bl" | "br" | null;
    startX: number;
    startY: number;
    startCrop: CropRect;
  }>({
    type: null,
    startX: 0,
    startY: 0,
    startCrop: { x: 0, y: 0, w: 1, h: 1 },
  });

  // ── helper: clamp crop to [0,1] and min 0.05 size
  const clamp = useCallback((r: CropRect): CropRect => {
    let { x, y, w, h } = r;
    w = Math.max(0.05, Math.min(w, 1 - x));
    h = Math.max(0.05, Math.min(h, 1 - y));
    x = Math.max(0, Math.min(x, 1 - w));
    y = Math.max(0, Math.min(y, 1 - h));
    return { x, y, w, h };
  }, []);

  // ── pointer events (unified mouse + touch)
  const getXY = useCallback((e: MouseEvent | TouchEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const src = "touches" in e ? e.touches[0] : e;
    return {
      px: (src.clientX - rect.left) / rect.width,
      py: (src.clientY - rect.top) / rect.height,
    };
  }, []);

  const onPointerDown = (
    type: "move" | "tl" | "tr" | "bl" | "br",
    e: React.MouseEvent | React.TouchEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const nativeE = ("touches" in e ? e.nativeEvent : e.nativeEvent) as
      | MouseEvent
      | TouchEvent;
    const { px, py } = getXY(nativeE);
    dragState.current = {
      type,
      startX: px,
      startY: py,
      startCrop: { ...cropRef.current },
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      const ds = dragState.current;
      if (!ds.type) return;
      const { px, py } = getXY(e);
      const dx = px - ds.startX;
      const dy = py - ds.startY;
      const sc = ds.startCrop;
      let next: CropRect = { ...sc };

      switch (ds.type) {
        case "move":
          next = { ...sc, x: sc.x + dx, y: sc.y + dy };
          break;
        case "tl":
          next = { x: sc.x + dx, y: sc.y + dy, w: sc.w - dx, h: sc.h - dy };
          break;
        case "tr":
          next = { x: sc.x, y: sc.y + dy, w: sc.w + dx, h: sc.h - dy };
          break;
        case "bl":
          next = { x: sc.x + dx, y: sc.y, w: sc.w - dx, h: sc.h + dy };
          break;
        case "br":
          next = { x: sc.x, y: sc.y, w: sc.w + dx, h: sc.h + dy };
          break;
      }
      cropRef.current = clamp(next);
      forceUpdate((n) => n + 1);
    };

    const onUp = () => {
      dragState.current.type = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [clamp, getXY]);

  const handleCrop = () => {
    const img = imgRef.current;
    if (!img) {
      onSkip();
      return;
    }
    const { x, y, w, h } = cropRef.current;
    const canvas = document.createElement("canvas");
    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    const sx = x * srcW;
    const sy = y * srcH;
    const sw = w * srcW;
    const sh = h * srcH;
    // Square output
    const size = Math.min(sw, sh);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
    onCrop(canvas.toDataURL("image/jpeg", 0.9));
  };

  const { x, y, w, h } = cropRef.current;
  const HANDLE = 20; // px

  return (
    <div
      className="fixed inset-0 z-[1400] flex flex-col"
      style={{ background: "rgba(10,0,20,0.97)" }}
      data-ocid="crop.modal"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe-top pt-5 pb-3">
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
          Crop your photo
        </p>
        <div
          className="px-3 py-1 rounded-full"
          style={{
            background: "rgba(236,72,153,0.18)",
            border: "1px solid rgba(236,72,153,0.4)",
          }}
        >
          <span className="text-xs font-bold" style={{ color: "#f9a8d4" }}>
            ✂️ Drag corners to resize
          </span>
        </div>
      </div>

      {/* Image + crop overlay */}
      <div
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center select-none overflow-hidden mx-4 rounded-2xl"
        style={{ touchAction: "none" }}
      >
        {/* Dim background */}
        <img
          ref={imgRef}
          src={imageSrc}
          alt="crop source"
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
          style={{ opacity: 0.3, pointerEvents: "none" }}
        />

        {/* Bright crop window (positioned via % of container) */}
        <div
          className="absolute overflow-hidden rounded-xl"
          style={{
            left: `${x * 100}%`,
            top: `${y * 100}%`,
            width: `${w * 100}%`,
            height: `${h * 100}%`,
            boxShadow: "0 0 0 2px #ec4899, 0 0 0 4px rgba(236,72,153,0.25)",
          }}
        >
          <img
            src={imageSrc}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              left: `${-(x / w) * 100}%`,
              top: `${-(y / h) * 100}%`,
              width: `${(1 / w) * 100}%`,
              height: `${(1 / h) * 100}%`,
              objectFit: "contain",
              pointerEvents: "none",
            }}
          />
          {/* Rule of thirds grid */}
          {[33, 66].map((p) => (
            <>
              <div
                key={`v${p}`}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${p}%`,
                  width: 1,
                  background: "rgba(255,255,255,0.25)",
                }}
              />
              <div
                key={`h${p}`}
                className="absolute left-0 right-0"
                style={{
                  top: `${p}%`,
                  height: 1,
                  background: "rgba(255,255,255,0.25)",
                }}
              />
            </>
          ))}
          {/* Move handle (full area) */}
          <div
            className="absolute inset-0 cursor-move"
            onMouseDown={(e) => onPointerDown("move", e)}
            onTouchStart={(e) => onPointerDown("move", e)}
          />
        </div>

        {/* Corner resize handles */}
        {(
          [
            ["tl", x, y, "cursor-nw-resize"],
            ["tr", x + w, y, "cursor-ne-resize"],
            ["bl", x, y + h, "cursor-sw-resize"],
            ["br", x + w, y + h, "cursor-se-resize"],
          ] as const
        ).map(([corner, cx, cy, cur]) => (
          <div
            key={corner}
            className={`absolute z-10 ${cur}`}
            style={{
              left: `calc(${cx * 100}% - ${HANDLE / 2}px)`,
              top: `calc(${cy * 100}% - ${HANDLE / 2}px)`,
              width: HANDLE,
              height: HANDLE,
              borderRadius: "50%",
              background: "#ec4899",
              boxShadow:
                "0 0 0 3px rgba(236,72,153,0.4), 0 2px 8px rgba(0,0,0,0.5)",
              touchAction: "none",
            }}
            onMouseDown={(e) => onPointerDown(corner, e)}
            onTouchStart={(e) => onPointerDown(corner, e)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 px-5 py-5 pb-safe-bottom">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 py-3.5 rounded-full font-bold text-sm text-white/70 border border-white/15 active:scale-95 transition-smooth"
          data-ocid="crop.skip_button"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleCrop}
          className="flex-[2] py-3.5 rounded-full font-bold text-sm active:scale-95 transition-smooth text-white"
          style={{
            background: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
            boxShadow: "0 4px 20px rgba(236,72,153,0.45)",
          }}
          data-ocid="crop.confirm_button"
        >
          ✂️ Crop &amp; Continue
        </button>
      </div>
    </div>
  );
}

// ─── CameraPage ───────────────────────────────────────────────────────────────
export default function CameraPage({ onCapture, onClose }: CameraPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(
    async (mode: FacingMode, signal?: { cancelled: boolean }) => {
      setIsLoading(true);
      setErrorMsg(null);
      setIsReady(false);
      stopStream();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1080 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (signal?.cancelled) {
          for (const t of stream.getTracks()) t.stop();
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!signal?.cancelled) setIsReady(true);
          };
        }
      } catch (err) {
        if (!signal?.cancelled) {
          const e = err as DOMException;
          if (
            e.name === "NotAllowedError" ||
            e.name === "PermissionDeniedError"
          ) {
            setErrorMsg(
              "Camera access was denied pookie! Please allow camera access and try again. 🎀",
            );
          } else if (e.name === "NotFoundError") {
            setErrorMsg("No camera found on this device pookie! 😢");
          } else {
            setErrorMsg("Something went wrong with the camera pookie! 😢");
          }
        }
      } finally {
        if (!signal?.cancelled) setIsLoading(false);
      }
    },
    [stopStream],
  );

  // Start stream on mount and whenever facingMode changes
  useEffect(() => {
    const signal = { cancelled: false };
    void startStream(facingMode, signal);
    return () => {
      signal.cancelled = true;
      stopStream();
    };
  }, [facingMode, startStream, stopStream]);

  const handleFlip = () => {
    setIsReady(false);
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const captureToDataUrl = (): string | null => {
    const video = videoRef.current;
    if (!video || !isReady) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    if (facingMode === "user") {
      // Mirror front camera selfie
      ctx.translate(1080, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, 1080, 1080);
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  const handleCapture = () => {
    const dataUrl = captureToDataUrl();
    if (!dataUrl) return;
    setCropSrc(dataUrl);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCropSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetry = () => {
    stopStream();
    void startStream(facingMode);
  };

  // Crop resolved — either with cropped image or original
  const handleCropDone = (dataUrl: string) => {
    setCropSrc(null);
    onCapture(dataUrl);
  };

  const handleCropSkip = () => {
    if (cropSrc) {
      const original = cropSrc;
      setCropSrc(null);
      onCapture(original);
    }
  };

  const isFront = facingMode === "user";

  return (
    <>
      {/* Crop modal — shown after capture or upload */}
      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          onCrop={handleCropDone}
          onSkip={handleCropSkip}
        />
      )}

      <div
        className="fixed inset-0 z-[1200] bg-black flex flex-col"
        data-ocid="camera.page"
      >
        {/* Camera preview area */}
        <div className="flex-1 relative overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{
              minHeight: "100%",
              transform: isFront ? "scaleX(-1)" : "none",
              transition: "transform 0.3s ease",
            }}
          />

          {/* Error state */}
          {errorMsg && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center bg-black/80 z-10"
              data-ocid="camera.error_state"
            >
              <span className="text-5xl">🙈</span>
              <p className="text-white font-bold text-sm max-w-xs leading-relaxed">
                {errorMsg}
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold text-xs uppercase tracking-widest active:scale-90 transition-smooth"
                data-ocid="camera.retry_button"
              >
                Try Again 🐼
              </button>
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && !errorMsg && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/70 z-10"
              data-ocid="camera.loading_state"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-white/70 font-bold text-xs uppercase tracking-widest">
                  {isLoading && facingMode === "environment"
                    ? "Switching camera..."
                    : "Warming up pookie..."}
                </p>
              </div>
            </div>
          )}

          {/* Smile prompt pill */}
          {isReady && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="px-6 py-2.5 bg-white/15 backdrop-blur-md rounded-full border border-white/25 shadow-lg">
                <p className="text-white font-bold text-[10px] uppercase tracking-[0.3em]">
                  Smile pookie! 🎀
                </p>
              </div>
            </div>
          )}

          {/* Camera flip button — top right */}
          <button
            type="button"
            onClick={handleFlip}
            disabled={isLoading}
            aria-label={
              isFront ? "Switch to back camera" : "Switch to front camera"
            }
            data-ocid="camera.flip_button"
            className="absolute top-10 right-5 w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-smooth disabled:opacity-40"
            style={{
              background: "rgba(236,72,153,0.22)",
              border: "1.5px solid rgba(236,72,153,0.55)",
              boxShadow: "0 2px 12px rgba(236,72,153,0.3)",
              backdropFilter: "blur(8px)",
            }}
          >
            <FlipHorizontal2 size={20} style={{ color: "#f9a8d4" }} />
          </button>

          {/* Front/back indicator badge */}
          {isReady && (
            <div className="absolute top-10 left-5 pointer-events-none">
              <div
                className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest"
                style={{
                  background: "rgba(236,72,153,0.18)",
                  border: "1px solid rgba(236,72,153,0.4)",
                  color: "#f9a8d4",
                  backdropFilter: "blur(6px)",
                }}
              >
                {isFront ? "📸 Front" : "🌍 Back"}
              </div>
            </div>
          )}
        </div>

        {/* Bottom control bar */}
        <div className="h-56 bg-slate-900 flex items-center justify-around px-10 rounded-t-[4rem] shadow-2xl">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-smooth hover:bg-white/10"
            aria-label="Close camera"
            data-ocid="camera.close_button"
          >
            <X size={26} />
          </button>

          {/* Capture button */}
          <button
            type="button"
            onClick={handleCapture}
            disabled={!isReady || isLoading}
            className="w-24 h-24 rounded-full border-[6px] border-white/20 p-1.5 active:scale-90 transition-smooth group disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Capture photo"
            data-ocid="camera.capture_button"
          >
            <div className="w-full h-full bg-primary rounded-full group-hover:scale-95 transition-smooth flex items-center justify-center shadow-pookie-lg">
              <Smile size={32} className="text-primary-foreground" />
            </div>
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={handleUpload}
          />

          {/* Upload photo button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 text-white active:scale-90 transition-smooth hover:bg-white/10"
            aria-label="Upload a photo from your device"
            data-ocid="camera.upload_button"
          >
            <ImagePlus size={22} />
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
              Upload
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
