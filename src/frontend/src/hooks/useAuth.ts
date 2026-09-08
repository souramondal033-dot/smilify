import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useCallback, useState } from "react";
import type { UserProfile } from "../lib/types";

export interface UseAuthReturn {
  isAuthenticated: boolean;
  loginStatus: string;
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;
  login: () => void;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const isAuthenticated = loginStatus === "success" && !!identity;

  const logout = useCallback(() => {
    clear();
    setProfile(null);
  }, [clear]);

  return {
    isAuthenticated,
    loginStatus,
    profile,
    setProfile,
    login,
    logout,
  };
}
