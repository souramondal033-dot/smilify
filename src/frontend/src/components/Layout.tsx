import {
  Camera,
  Globe,
  Heart,
  Home,
  Info,
  ShoppingBag,
  Trophy,
  User as UserIcon,
  Zap,
} from "lucide-react";
import React from "react";
import { useDevice } from "../hooks/use-device";
import { ASSETS } from "../lib/constants";
import type { UserProfile, View } from "../lib/types";

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
  profile: UserProfile | null;
  toast: string | null;
  notificationBell?: React.ReactNode;
}

export function Layout({
  children,
  currentView,
  onNavigate,
  profile,
  toast,
  notificationBell,
}: LayoutProps) {
  const device = useDevice();

  // Build device-specific class string for root element
  const deviceClass = [
    device.isIOS && "device-ios",
    device.isAndroid && "device-android",
    device.isMac && "device-mac",
    device.isWindows && "device-windows",
    device.isTablet && "device-tablet",
    device.isDesktop && "device-desktop",
    device.isMobile && "device-mobile",
    `device-${device.type}`,
  ]
    .filter(Boolean)
    .join(" ");

  // iOS safe-area padding for header
  const iosHeaderPadding =
    device.isIOS && device.safeAreaInsets.top > 0
      ? { paddingTop: device.safeAreaInsets.top + 16 }
      : undefined;

  // iOS safe-area padding for bottom nav
  const iosNavPadding =
    device.isIOS && device.safeAreaInsets.bottom > 0
      ? { paddingBottom: device.safeAreaInsets.bottom + 8 }
      : undefined;

  // Desktop: sidebar layout
  const isDesktopLayout = device.isDesktop || device.isTablet;

  return (
    <div
      className={`fixed inset-0 bg-[#FFF8FA] flex flex-col overflow-hidden font-body select-none ${deviceClass}`}
    >
      {/* Toast */}
      {toast && (
        <div
          data-ocid="toast"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[1100] bg-card/90 backdrop-blur-md text-primary px-6 py-3 rounded-full shadow-pookie-lg border border-border flex items-center gap-3 slide-in-from-top pointer-events-none"
        >
          <span className="animate-beat text-sm">💖</span>
          <span className="text-[11px] font-bold uppercase tracking-widest">
            {toast}
          </span>
        </div>
      )}

      {/* Header */}
      <header
        className="px-5 py-4 flex justify-between items-center bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-[100]"
        style={iosHeaderPadding}
      >
        <div className="flex items-center gap-2.5">
          <img src={ASSETS.LOGO} alt="Smilify" className="w-9 h-9" />
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="text-xl font-bold tracking-tight text-foreground cursor-pointer bg-transparent border-none p-0"
            data-ocid="home.link"
          >
            Smilify
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-primary-foreground font-bold text-[11px] shadow-pookie">
            <Zap size={11} className="fill-current" />
            <span>{profile?.tokens ?? 0}</span>
          </div>
          {notificationBell}
          <button
            type="button"
            onClick={() => onNavigate("me")}
            className="w-10 h-10 rounded-full bg-card border-2 border-border shadow-xs flex items-center justify-center text-primary active:scale-90 transition-smooth overflow-hidden"
            aria-label="My Profile"
            data-ocid="profile.button"
          >
            {profile?.profilePicUrl ? (
              <img
                src={profile.profilePicUrl}
                alt={profile.name ?? "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon size={18} />
            )}
          </button>
        </div>
      </header>

      {/* Body: sidebar on desktop, stacked on mobile */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav — desktop/tablet only */}
        {isDesktopLayout && (
          <aside className="w-64 bg-card border-r border-border flex flex-col py-6 px-3 gap-1 shrink-0 overflow-y-auto">
            <div className="px-3 mb-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em]">
                Navigation
              </p>
            </div>
            <SidebarBtn
              icon={<Home />}
              label="Home"
              active={currentView === "home"}
              onClick={() => onNavigate("home")}
              ocid="sidebar.home.button"
            />
            <SidebarBtn
              icon={<Globe />}
              label="Global Wall"
              active={currentView === "wall"}
              onClick={() => onNavigate("wall")}
              ocid="sidebar.wall.button"
            />
            <SidebarBtn
              icon={<Camera />}
              label="Post a Smile"
              active={currentView === "camera"}
              onClick={() => onNavigate("camera")}
              ocid="sidebar.camera.button"
              highlight
            />
            <SidebarBtn
              icon={<ShoppingBag />}
              label="Pookie Shop"
              active={currentView === "shop"}
              onClick={() => onNavigate("shop")}
              ocid="sidebar.shop.button"
            />
            <SidebarBtn
              icon={<Trophy />}
              label="Leaderboard"
              active={currentView === "leaderboard"}
              onClick={() => onNavigate("leaderboard")}
              ocid="sidebar.leaderboard.button"
            />
            <SidebarBtn
              icon={<Info />}
              label="About"
              active={currentView === "info"}
              onClick={() => onNavigate("info")}
              ocid="sidebar.info.button"
            />
            <SidebarBtn
              icon={<Heart />}
              label="Welfare Fund"
              active={currentView === "welfare"}
              onClick={() => onNavigate("welfare")}
              ocid="sidebar.welfare.button"
            />
          </aside>
        )}

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto pb-36 no-scrollbar">
          <div
            className={
              isDesktopLayout ? "max-w-2xl mx-auto px-4" : "max-w-md mx-auto"
            }
          >
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Nav — mobile/iOS only */}
      {!isDesktopLayout && (
        <nav
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-2 rounded-[2.5rem] bg-foreground/90 backdrop-blur-xl shadow-pookie-lg z-[300] border border-white/10"
          data-ocid="bottom.nav"
          style={iosNavPadding}
        >
          <NavBtn
            icon={<Home />}
            active={currentView === "home"}
            onClick={() => onNavigate("home")}
            label="Home"
            ocid="nav.home.button"
          />
          <NavBtn
            icon={<Globe />}
            active={currentView === "wall"}
            onClick={() => onNavigate("wall")}
            label="Wall"
            ocid="nav.wall.button"
          />
          <button
            type="button"
            onClick={() => onNavigate("camera")}
            className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-1.5 active:scale-90 transition-smooth shadow-pookie-lg"
            aria-label="Take Smile Photo"
            data-ocid="nav.camera.button"
          >
            <Camera size={26} />
          </button>
          <NavBtn
            icon={<ShoppingBag />}
            active={currentView === "shop"}
            onClick={() => onNavigate("shop")}
            label="Shop"
            ocid="nav.shop.button"
          />
          <NavBtn
            icon={<Trophy />}
            active={currentView === "leaderboard"}
            onClick={() => onNavigate("leaderboard")}
            label="Leaderboard"
            ocid="nav.leaderboard.button"
          />
          <NavBtn
            icon={<Info />}
            active={currentView === "info"}
            onClick={() => onNavigate("info")}
            label="Info"
            ocid="nav.info.button"
          />
          <NavBtn
            icon={<Heart />}
            active={currentView === "welfare"}
            onClick={() => onNavigate("welfare")}
            label="Give"
            ocid="nav.welfare.button"
          />
        </nav>
      )}

      {/* Branding footer */}
      <footer className="text-center text-[10px] text-muted-foreground/50 py-2 font-body">
        <p>
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

interface NavBtnProps {
  icon: React.ReactElement;
  active: boolean;
  onClick: () => void;
  label: string;
  ocid: string;
}

interface SidebarBtnProps {
  icon: React.ReactElement;
  active: boolean;
  onClick: () => void;
  label: string;
  ocid: string;
  highlight?: boolean;
}

function SidebarBtn({
  icon,
  active,
  onClick,
  label,
  ocid,
  highlight,
}: SidebarBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-ocid={ocid}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-smooth ${
        highlight
          ? "bg-primary text-primary-foreground shadow-pookie"
          : active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {React.cloneElement(icon, {
        size: 18,
      } as React.HTMLAttributes<SVGElement>)}
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

function NavBtn({ icon, active, onClick, label, ocid }: NavBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-ocid={ocid}
      className={`w-14 h-14 rounded-full flex items-center justify-center transition-smooth ${
        active
          ? "bg-card text-primary shadow-pookie scale-110"
          : "text-card/40 active:scale-90 hover:text-card/70"
      }`}
    >
      {React.cloneElement(icon, {
        size: 22,
      } as React.HTMLAttributes<SVGElement>)}
    </button>
  );
}
