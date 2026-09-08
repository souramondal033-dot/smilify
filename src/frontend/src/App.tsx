import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Cloud, Sparkles } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createActor } from "./backend";
import { ExternalBlob } from "./backend";
import { CookieBanner, needsCookieConsent } from "./components/CookieBanner";
import { FeedbackPopup } from "./components/FeedbackPopup";
import { Layout } from "./components/Layout";
import { NotificationBell } from "./components/NotificationBell";
import { PookieChat } from "./components/PookieChat";
import { useGeolocation } from "./hooks/useGeolocation";
import { useSmiles } from "./hooks/useSmiles";
import { ALL_STICKERS, ASSETS } from "./lib/constants";
import {
  requestPookieNotificationPermission,
  triggerReEngagementNotification,
} from "./lib/pookieNotifications";
import type { PlacedSticker, UserProfile, View } from "./lib/types";
import AboutPage from "./pages/AboutPage";
import { AccountSettingsPage } from "./pages/AccountSettingsPage";
import AdminPage from "./pages/AdminPage";
import CameraPage from "./pages/CameraPage";
import ContentHubPage from "./pages/ContentHubPage";
import EditorPage from "./pages/EditorPage";
import { HomePage } from "./pages/HomePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import PrivacyPage from "./pages/PrivacyPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ShopPage } from "./pages/ShopPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import TermsPage from "./pages/TermsPage";
import WallPage from "./pages/WallPage";
import WelfarePage from "./pages/WelfarePage";

void ALL_STICKERS;

const ADMIN_NAMES = ["Souradipta", "Souvik", "Sampurna"];
const ADMIN_EMAIL = "smilifytechhelp@gmail.com";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// ── Splash Screen ─────────────────────────────────────────────────────────
function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[2000] bg-[#FFF8FA] flex flex-col items-center justify-center fade-in overflow-hidden">
      <div className="relative mb-6">
        <img
          src={ASSETS.LOGO}
          alt="Smilify"
          className="w-24 h-24 animate-bounce-gentle"
        />
        <Sparkles
          className="absolute -top-2 -right-4 text-primary animate-pulse-soft"
          size={24}
        />
      </div>
      <h1 className="text-3xl font-bold text-foreground tracking-tight">
        Smilify
      </h1>
      <p className="mt-4 text-[11px] font-bold text-primary uppercase tracking-[0.3em] px-8 text-center animate-pulse-soft leading-loose">
        Unifying everyone with just a smile 😊
      </p>
      <Cloud
        className="absolute top-20 left-10 text-primary/10 animate-float-slow"
        size={60}
      />
      <Cloud
        className="absolute bottom-40 right-10 text-primary/15 animate-float"
        size={80}
      />
      <div className="mt-8 flex gap-1.5">
        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
        <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:0.4s]" />
      </div>
    </div>
  );
}

/**
 * Extracts a hex blob ID from the raw Uint8Array returned by _uploadFile.
 * _uploadFile always returns Uint8Array directly (not a Result variant).
 * Validates that the result is a non-empty hex string that is NOT a URL.
 */
function extractBlobId(raw: unknown): string {
  let bytes: Uint8Array | null = null;

  if (raw instanceof Uint8Array) {
    bytes = raw;
  } else if (
    Array.isArray(raw) &&
    raw.length > 0 &&
    typeof raw[0] === "number"
  ) {
    bytes = new Uint8Array(raw as number[]);
  } else if (typeof raw === "string") {
    if (
      raw.length >= 16 &&
      !raw.startsWith("http") &&
      !raw.startsWith("data:") &&
      /^[0-9a-fA-F]+$/.test(raw)
    ) {
      return raw;
    }
    console.error(
      "[extractBlobId] string is not a valid hex id:",
      raw.slice(0, 80),
    );
    throw new Error(
      "Upload returned an invalid image reference — please try again",
    );
  } else if (raw !== null && raw !== undefined && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (obj.__kind__ === "err" || "err" in obj) {
      const errVal = obj.err ?? obj.__kind__;
      throw new Error(`Upload failed: ${String(errVal ?? "unknown error")}`);
    }
    const inner =
      obj.__kind__ === "ok"
        ? (obj.ok ?? obj.value)
        : (obj.ok ?? obj.value ?? obj.text);
    if (inner instanceof Uint8Array) {
      bytes = inner;
    } else if (
      Array.isArray(inner) &&
      inner.length > 0 &&
      typeof inner[0] === "number"
    ) {
      bytes = new Uint8Array(inner as number[]);
    } else {
      console.error(
        "[extractBlobId] unexpected object shape:",
        JSON.stringify(obj).slice(0, 200),
      );
      throw new Error(
        "Upload returned an unrecognised format — please try again",
      );
    }
  }

  if (!bytes || bytes.length === 0) {
    console.error("[extractBlobId] no bytes found in result:", typeof raw, raw);
    throw new Error(
      "Upload succeeded but returned no image data — please try again",
    );
  }

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (hex.length < 16) {
    console.error("[extractBlobId] hex too short:", hex.length, hex);
    throw new Error(
      "Upload returned an invalid image reference — please try again",
    );
  }
  if (hex.startsWith("http") || hex.startsWith("data:")) {
    console.error("[extractBlobId] hex looks like a URL:", hex.slice(0, 80));
    throw new Error(
      "Upload returned a URL instead of an image reference — refusing to publish",
    );
  }

  return hex;
}

// ── App Root ──────────────────────────────────────────────────────────────
export default function App() {
  const { loginStatus, isAuthenticated } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const [currentView, setCurrentView] = useState<View>("home");
  const [showSplash, setShowSplash] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [highlightSmileId, setHighlightSmileId] = useState<string | null>(null);
  const [inviteHandled, setInviteHandled] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  // Track whether we have already kicked off a profile fetch for this session
  const profileFetchedRef = useRef(false);
  const welcomeShownRef = useRef(false);
  void highlightSmileId;

  // Editor state
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [activeStickerId, setActiveStickerId] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Geolocation hook — non-blocking, used at publish time
  const { getLocation } = useGeolocation();

  // Wall smiles
  const {
    smiles,
    isLoading: smilesLoading,
    refresh: refreshSmiles,
    deleteSmileLocally,
  } = useSmiles();

  // Splash timer
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Reset profile state when the user logs out / session ends
  useEffect(() => {
    if (!isAuthenticated) {
      // Reset fetch guard so that next login always attempts a fresh fetch
      profileFetchedRef.current = false;
      welcomeShownRef.current = false;
      setProfile(null);
      setIsFetchingProfile(false);
    }
  }, [isAuthenticated]);

  // Fetch profile once after login AND actor is ready.
  // Guard: all three conditions must be true — authenticated, actor ready (not null,
  // not still fetching), and we haven't successfully fetched yet this session.
  useEffect(() => {
    // Wait until the actor is fully initialised before attempting any call
    if (!isAuthenticated || actorFetching || !actor) return;
    // Skip if we already completed a fetch in this session
    if (profileFetchedRef.current) return;

    setIsFetchingProfile(true);

    void (async () => {
      try {
        const backendProfile = await actor.getMyProfile();

        // ── Mark fetch as done only after a successful response ──────────
        profileFetchedRef.current = true;

        if (backendProfile) {
          const mappedProfile: UserProfile = {
            name: backendProfile.name,
            email: backendProfile.email,
            country: backendProfile.country,
            tokens: Number(backendProfile.tokens),
            totalSmiles: Number(backendProfile.totalSmiles),
            unlockedStickers: backendProfile.unlockedStickers,
            uid: backendProfile.id.toText(),
            joinedAt: backendProfile.joinedAt
              ? { seconds: Number(backendProfile.joinedAt / 1_000_000_000n) }
              : undefined,
            badges: backendProfile.badges as UserProfile["badges"],
            lastPostDate: backendProfile.lastPostDate,
            currentStreak: backendProfile.currentStreak,
            lastLoginTime: backendProfile.lastLoginTime,
            referralCode: backendProfile.referralCode,
            referralCount: Number(backendProfile.referralCount),
          };
          setProfile(mappedProfile);

          // ── Admin fast-track ──────────────────────────────────────────
          if (
            ADMIN_NAMES.includes(mappedProfile.name) &&
            mappedProfile.email === ADMIN_EMAIL
          ) {
            setCurrentView("admin");
          }

          // ── Welcome back toast (once per session) ────────────────────
          if (!welcomeShownRef.current) {
            welcomeShownRef.current = true;
            const sessionKey = `wb_shown_${mappedProfile.uid}`;
            if (!sessionStorage.getItem(sessionKey)) {
              sessionStorage.setItem(sessionKey, "1");
              triggerToast(`Welcome back, ${mappedProfile.name}! 🐼`);
            }
          }

          // ── Re-engagement notification (>7 days away) ────────────────
          const lastLogin = backendProfile.lastLoginTime;
          if (lastLogin && lastLogin > 0n) {
            const lastLoginMs = Number(lastLogin / 1_000_000n);
            const nowMs = Date.now();
            const storageKey = `re_engage_${mappedProfile.uid}`;
            const lastShown = localStorage.getItem(storageKey);
            const alreadyShownRecently =
              lastShown && nowMs - Number(lastShown) < SEVEN_DAYS_MS;

            if (!alreadyShownRecently && nowMs - lastLoginMs > SEVEN_DAYS_MS) {
              localStorage.setItem(storageKey, String(nowMs));
              // Delay slightly so it appears after welcome toast
              setTimeout(() => {
                triggerToast(
                  `We missed you, ${mappedProfile.name}! 🐼 Your smile was missing from Smilify!`,
                );
              }, 4000);
              // Also fire Web Notification + custom event (throttled internally)
              setTimeout(() => {
                triggerReEngagementNotification(lastLoginMs);
              }, 4500);
            }
          }

          // ── Update last login time ────────────────────────────────────
          void actor.updateLastLoginTime();
        }
        // If null → no profile yet → show SignUpPage
      } catch {
        // Fetch failed — reset guard so the user can retry on next render cycle
        // (e.g., after a network blip or a page refresh)
        profileFetchedRef.current = false;
      } finally {
        setIsFetchingProfile(false);
      }
    })();
  }, [isAuthenticated, actor, actorFetching]);

  // Show cookie banner for anyone who hasn't consented yet (runs once on mount)
  useEffect(() => {
    if (needsCookieConsent()) {
      setShowCookieBanner(true);
    }
  }, []);

  // Request notification permission quietly after app mounts (non-blocking)
  useEffect(() => {
    void requestPookieNotificationPermission();
  }, []);

  // Listen for pookie:reengage custom events — show in-app toast
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail;
      if (msg) triggerToast(msg);
    };
    window.addEventListener("pookie:reengage", handler);
    return () => window.removeEventListener("pookie:reengage", handler);
  }, []);

  // Handle invite deep link: ?invite=<code>
  useEffect(() => {
    if (inviteHandled || !actor) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("invite");
    if (!code) return;
    setInviteHandled(true);
    void (async () => {
      try {
        const result = await actor.getSmileByInvite(code);
        if (result.__kind__ === "ok") {
          const smile = result.ok;
          const smileId = smile.id;
          setHighlightSmileId(smileId);
          setCurrentView("wall");
          triggerToast(`Viewing shared smile from ${smile.userName}! 🎀`);
          setTimeout(() => {
            const el = document.getElementById(`smile-${smileId}`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 600);
        }
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      } catch {
        // silent — invalid or expired invite code
      }
    })();
  }, [actor, inviteHandled]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleCapture = (imageDataUrl: string) => {
    setEditingImage(imageDataUrl);
    setPlacedStickers([]);
    setActiveStickerId(null);
    setCurrentView("editor");
  };

  const publishSmile = async () => {
    // Guard: prevent double-submit
    if (isPublishing) return;
    if (!editingImage) return;

    if (!actor) {
      triggerToast(
        "App is still loading pookie! Please wait a moment and try again \uD83D\uDC3C",
      );
      return;
    }
    if (!profile) {
      triggerToast(
        "Profile still loading pookie! Please wait a moment \uD83D\uDC96",
      );
      return;
    }

    setIsPublishing(true);

    try {
      // \u2500\u2500 Step 1: Draw canvas with base image + stickers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      const img = new Image();
      img.src = editingImage;
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("Image failed to load"));
        setTimeout(() => rej(new Error("Image load timed out")), 10_000);
      });
      ctx.drawImage(img, 0, 0, 1080, 1080);

      for (const s of placedStickers) {
        ctx.save();
        ctx.translate(s.x * 1080, s.y * 1080);
        ctx.rotate(((s.rotation ?? 0) * Math.PI) / 180);
        ctx.font = `${(s.scale ?? 1) * 160}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.emoji, 0, 0);
        ctx.restore();
      }

      // \u2500\u2500 Step 2: Encode canvas \u2192 JPEG bytes \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      if (!dataUrl || dataUrl === "data:,") {
        throw new Error(
          "Photo capture failed \u2014 please retake your photo \uD83D\uDCF8",
        );
      }
      const base64 = dataUrl.split(",")[1] ?? "";
      if (!base64)
        throw new Error(
          "Photo encoding failed \u2014 please retake your photo \uD83D\uDCF8",
        );

      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      if (bytes.length === 0)
        throw new Error(
          "Photo produced no data \u2014 please retake your photo \uD83D\uDCF8",
        );
      console.log("[publishSmile] encoded", bytes.length, "bytes");

      // \u2500\u2500 Step 3: Upload blob \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      // _uploadFile returns Promise<Uint8Array> directly \u2014 NOT a Result.
      const actorInternal = actor as unknown as {
        _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>;
      };
      const externalBlob = ExternalBlob.fromBytes(bytes);

      let rawUploadResult: unknown;
      try {
        rawUploadResult = await actorInternal._uploadFile(externalBlob);
      } catch (uploadErr) {
        const msg =
          uploadErr instanceof Error ? uploadErr.message : String(uploadErr);
        console.error("[publishSmile] _uploadFile threw:", msg);
        throw new Error(`Upload failed: ${msg}`);
      }

      console.log(
        "[publishSmile] upload raw result type:",
        typeof rawUploadResult,
        rawUploadResult instanceof Uint8Array
          ? `Uint8Array(${rawUploadResult.length})`
          : JSON.stringify(rawUploadResult)?.slice(0, 100),
      );

      // \u2500\u2500 Step 4: Extract and validate blob ID \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      const imageBlobId = extractBlobId(rawUploadResult);
      console.log(
        "[publishSmile] imageBlobId len:",
        imageBlobId.length,
        "prefix:",
        imageBlobId.slice(0, 16),
      );

      // \u2500\u2500 Step 5: Post smile \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      // ── Step 4b: Start geolocation fetch early, non-blocking ────────────
      const geoPromise = getLocation().catch(() => null);

      // ── Step 5: Post smile (with location if available) ──────────────────
      // Await geo result — getLocation resolves within 3s max or returns null
      let geoForPost: { region: string; state: string } | null = null;
      try {
        geoForPost = await geoPromise;
      } catch {
        // never block publish on geo failure
      }

      // Quietly request notification permission on first publish
      void requestPookieNotificationPermission();

      const postResult = await actor.postSmile({
        imageBlobId,
        inviteCode: undefined,
        userRegion: geoForPost?.region ?? undefined,
        userState: geoForPost?.state ?? undefined,
      });
      console.log(
        "[publishSmile] postSmile result __kind__:",
        postResult.__kind__,
      );

      if (postResult.__kind__ === "ok") {
        setEditingImage(null);
        setPlacedStickers([]);
        setActiveStickerId(null);
        setCurrentView("wall");
        refreshSmiles();
        triggerToast(
          "Your smile is live! \uD83D\uDE0A +10 Tokens earned \uD83C\uDF80",
        );
      } else {
        const errMsg = postResult.err ?? "Unknown error";
        console.error("[publishSmile] postSmile err:", errMsg);
        throw new Error(`Post failed: ${errMsg}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[publishSmile] failed:", msg);
      triggerToast(`${msg} \u2014 tap Publish to try again \uD83D\uDC3C`);
    } finally {
      setIsPublishing(false);
    }
  };

  const editorProfile: UserProfile = profile ?? {
    name: "",
    email: "",
    country: "",
    tokens: 100,
    totalSmiles: 0,
    unlockedStickers: ["halo"],
    uid: "",
  };

  if (showSplash) return <SplashScreen />;

  // Still initializing — show nothing to avoid flicker
  if (loginStatus === "initializing") return null;

  // ── Unauthenticated: show Sign In page (allow browsing Terms/Privacy) ──
  if (!isAuthenticated) {
    let page: ReactNode;
    if (currentView === "terms")
      page = <TermsPage onNavigate={setCurrentView} />;
    else if (currentView === "privacy")
      page = <PrivacyPage onNavigate={setCurrentView} />;
    else page = <SignInPage onNavigate={setCurrentView} />;
    return (
      <>
        {page}
        {showCookieBanner && (
          <CookieBanner
            onNavigate={setCurrentView}
            onDismiss={() => setShowCookieBanner(false)}
          />
        )}
      </>
    );
  }

  // ── Authenticated: actor still initialising OR profile fetch in progress ──
  if (isAuthenticated && (actorFetching || isFetchingProfile)) {
    return (
      <div className="fixed inset-0 z-[1500] bg-[#FFF8FA] flex flex-col items-center justify-center gap-4">
        <img
          src={ASSETS.LOGO}
          alt="Smilify"
          className="w-16 h-16 animate-bounce-gentle"
        />
        <p className="text-sm font-bold text-primary animate-pulse-soft">
          Loading your profile...
        </p>
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
          <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
          <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    );
  }

  // ── Authenticated but no profile: show Sign Up / registration ──
  if (isAuthenticated && !profile) {
    let page: ReactNode;
    if (currentView === "terms")
      page = <TermsPage onNavigate={setCurrentView} />;
    else if (currentView === "privacy")
      page = <PrivacyPage onNavigate={setCurrentView} />;
    else
      page = (
        <SignUpPage
          onProfileCreated={(newProfile) => {
            setProfile(newProfile);
            setCurrentView("home");
          }}
          onToast={triggerToast}
          onNavigate={setCurrentView}
        />
      );
    return (
      <>
        {page}
        {showCookieBanner && (
          <CookieBanner
            onNavigate={setCurrentView}
            onDismiss={() => setShowCookieBanner(false)}
          />
        )}
      </>
    );
  }

  // ── Full authenticated app ──
  return (
    <>
      <Layout
        currentView={currentView}
        onNavigate={setCurrentView}
        profile={profile}
        toast={toast}
        notificationBell={<NotificationBell />}
      >
        {currentView === "home" && (
          <HomePage profile={profile} setView={setCurrentView} />
        )}
        {currentView === "wall" && (
          <WallPage
            smiles={smiles}
            currentUid={profile?.uid}
            currentUserName={profile?.name}
            setView={setCurrentView}
            onToast={triggerToast}
            isLoading={smilesLoading}
            onRefresh={refreshSmiles}
            onDelete={deleteSmileLocally}
            onLike={(smileId) => {
              void actor?.likeSmile(smileId);
            }}
          />
        )}
        {currentView === "camera" && (
          <CameraPage
            onCapture={handleCapture}
            onClose={() => setCurrentView("home")}
          />
        )}
        {currentView === "editor" && editingImage && (
          <EditorPage
            editingImage={editingImage}
            placedStickers={placedStickers}
            setPlacedStickers={setPlacedStickers}
            activeStickerId={activeStickerId}
            setActiveStickerId={setActiveStickerId}
            profile={editorProfile}
            onPublish={publishSmile}
            onRetry={() => setCurrentView("camera")}
            isPublishing={isPublishing}
          />
        )}
        {currentView === "shop" && (
          <ShopPage
            profile={profile}
            setView={setCurrentView}
            onToast={triggerToast}
          />
        )}
        {currentView === "info" && <AboutPage />}
        {currentView === "me" && (
          <ProfilePage
            profile={profile}
            onNavigate={setCurrentView}
            onLogout={() => {
              setProfile(null);
              triggerToast("Logged out pookie! 💖");
            }}
          />
        )}
        {currentView === "admin" && (
          <AdminPage
            smiles={smiles.map((s) => ({
              id: s.id,
              userName: s.userName,
              userId: {
                isAnonymous: () => false,
                compareTo: () => 0,
                toText: () => s.userId,
                toUint8Array: () => new Uint8Array(),
              } as unknown as import("@icp-sdk/core/principal").Principal,
              createdAt: BigInt(s.createdAt?.seconds ?? 0) * 1_000_000_000n,
              likes: BigInt(s.likes),
              likedBy: [] as import("@icp-sdk/core/principal").Principal[],
              userCountry: s.country,
              imageBlobId: s.image,
              views: BigInt(s.views ?? 0),
              shares: BigInt(s.shares ?? 0),
              inviteCode: undefined,
              profilePicUrl: undefined,
            }))}
            onClose={() => setCurrentView("home")}
          />
        )}
        {currentView === "account-settings" && (
          <AccountSettingsPage
            profile={profile}
            onProfileUpdate={(updated) => setProfile(updated)}
            onLogout={() => {
              setProfile(null);
              triggerToast("Logged out pookie! 💖");
            }}
            onNavigate={setCurrentView}
          />
        )}
        {currentView === "content-hub" && <ContentHubPage />}
        {currentView === "terms" && <TermsPage onNavigate={setCurrentView} />}
        {currentView === "privacy" && (
          <PrivacyPage onNavigate={setCurrentView} />
        )}
        {currentView === "leaderboard" && <LeaderboardPage profile={profile} />}
        {currentView === "welfare" && (
          <WelfarePage onNavigate={setCurrentView} profile={profile} />
        )}
      </Layout>

      <PookieChat userName={profile?.name} />

      <FeedbackPopup />

      {showCookieBanner && (
        <CookieBanner
          onNavigate={setCurrentView}
          onDismiss={() => setShowCookieBanner(false)}
        />
      )}
    </>
  );
}
