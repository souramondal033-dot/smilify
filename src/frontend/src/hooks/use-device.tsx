import { useEffect, useState } from "react";

export interface DeviceInfo {
  type:
    | "ios-phone"
    | "ios-tablet"
    | "android-phone"
    | "android-tablet"
    | "mac"
    | "windows"
    | "linux"
    | "unknown";
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMac: boolean;
  isWindows: boolean;
  hasTouch: boolean;
  isLandscape: boolean;
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
  screenSize: "xs" | "sm" | "md" | "lg" | "xl";
}

function readSafeAreaInset(variable: string): number {
  if (typeof window === "undefined") return 0;
  const el = document.documentElement;
  const val = getComputedStyle(el).getPropertyValue(variable).trim();
  return val ? Number.parseFloat(val) || 0 : 0;
}

function detectDevice(): DeviceInfo {
  if (typeof window === "undefined") {
    return {
      type: "unknown",
      isMobile: false,
      isTablet: false,
      isDesktop: false,
      isIOS: false,
      isAndroid: false,
      isMac: false,
      isWindows: false,
      hasTouch: false,
      isLandscape: false,
      safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
      screenSize: "md",
    };
  }

  const ua = navigator.userAgent;
  const platform =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as unknown as Record<string, unknown>).userAgentData
      ? (
          (navigator as unknown as Record<string, unknown>)
            .userAgentData as Record<string, unknown>
        ).platform
      : navigator.platform;
  const platformStr = typeof platform === "string" ? platform : "";

  const hasTouch =
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches;

  const isIOSDevice =
    /iPhone|iPad|iPod/i.test(ua) ||
    (platformStr === "MacIntel" && hasTouch && navigator.maxTouchPoints > 1);

  const isAndroidDevice = /Android/i.test(ua);
  const isMacDevice = /Mac/i.test(platformStr) && !hasTouch && !isIOSDevice;
  const isWindowsDevice = /Win/i.test(platformStr) || /Windows/i.test(ua);
  const isLinuxDevice =
    /Linux/i.test(platformStr) && !isAndroidDevice && !isMacDevice;

  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const minDim = Math.min(screenWidth, screenHeight);

  const isIPad = /iPad/i.test(ua) || (isIOSDevice && minDim >= 600);
  const isAndroidTablet = isAndroidDevice && minDim >= 600;
  const isTablet = isIPad || isAndroidTablet;
  const isMobile = (isIOSDevice || isAndroidDevice) && !isTablet;
  const isDesktop = isMacDevice || isWindowsDevice || isLinuxDevice;

  let type: DeviceInfo["type"] = "unknown";
  if (isIPad) type = "ios-tablet";
  else if (isAndroidTablet) type = "android-tablet";
  else if (isIOSDevice) type = "ios-phone";
  else if (isAndroidDevice) type = "android-phone";
  else if (isMacDevice) type = "mac";
  else if (isWindowsDevice) type = "windows";
  else if (isLinuxDevice) type = "linux";

  const isLandscape = window.innerWidth > window.innerHeight;

  const w = window.innerWidth;
  let screenSize: DeviceInfo["screenSize"] = "md";
  if (w < 480) screenSize = "xs";
  else if (w < 768) screenSize = "sm";
  else if (w < 1024) screenSize = "md";
  else if (w < 1280) screenSize = "lg";
  else screenSize = "xl";

  const safeAreaInsets = {
    top: readSafeAreaInset("--sat"),
    bottom: readSafeAreaInset("--sab"),
    left: readSafeAreaInset("--sal"),
    right: readSafeAreaInset("--sar"),
  };

  return {
    type,
    isMobile,
    isTablet,
    isDesktop,
    isIOS: isIOSDevice,
    isAndroid: isAndroidDevice,
    isMac: isMacDevice,
    isWindows: isWindowsDevice,
    hasTouch,
    isLandscape,
    safeAreaInsets,
    screenSize,
  };
}

export function useDevice(): DeviceInfo {
  const [device, setDevice] = useState<DeviceInfo>(detectDevice);

  useEffect(() => {
    const update = () => setDevice(detectDevice());
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return device;
}

export function useIsMobile(): boolean {
  return useDevice().isMobile;
}
