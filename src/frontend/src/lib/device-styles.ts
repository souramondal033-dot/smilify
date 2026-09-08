import type { DeviceInfo } from "@/hooks/use-device";
import type { CSSProperties } from "react";

export type NavStyle = "bottom-tabs" | "sidebar" | "top-bar";
export type TypographyScale = "compact" | "normal" | "large";

export function getNavStyle(device: DeviceInfo): NavStyle {
  switch (device.type) {
    case "ios-phone":
    case "android-phone":
    case "ios-tablet":
      return "bottom-tabs";
    case "android-tablet":
    case "mac":
    case "windows":
    case "linux":
      return "sidebar";
    default:
      return "bottom-tabs";
  }
}

export function getTouchTargetSize(device: DeviceInfo): number {
  return device.hasTouch ? 48 : 36;
}

export function getTypographyScale(device: DeviceInfo): TypographyScale {
  switch (device.screenSize) {
    case "xs":
    case "sm":
      return "compact";
    case "md":
      return "normal";
    case "lg":
    case "xl":
      return "large";
  }
}

export function getCardColumns(device: DeviceInfo): number {
  switch (device.screenSize) {
    case "xs":
      return 1;
    case "sm":
      return 2;
    case "md":
      return 3;
    case "lg":
    case "xl":
      return 4;
  }
}

export function getSafeAreaStyle(device: DeviceInfo): CSSProperties {
  const { top, bottom, left, right } = device.safeAreaInsets;
  return {
    paddingTop: top > 0 ? top : undefined,
    paddingBottom: bottom > 0 ? bottom : undefined,
    paddingLeft: left > 0 ? left : undefined,
    paddingRight: right > 0 ? right : undefined,
  };
}
