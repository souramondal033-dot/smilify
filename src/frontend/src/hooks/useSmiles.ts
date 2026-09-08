import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useEffect, useRef, useState } from "react";
import { createActor } from "../backend";
import type { Smile as BackendSmile } from "../backend";
import type { Smile } from "../lib/types";

function mapSmile(s: BackendSmile): Smile {
  return {
    id: s.id,
    userId: s.userId.toString(),
    userName: s.userName,
    image: s.imageBlobId,
    likes: Number(s.likes),
    createdAt: s.createdAt
      ? { seconds: Number(s.createdAt / 1_000_000_000n) }
      : undefined,
    country: s.userCountry,
    views: Number(s.views ?? 0n),
    shares: Number(s.shares ?? 0n),
    profilePicUrl: s.profilePicUrl ?? null,
    // backend uses optional string; wrap in tuple for frontend Smile type
    inviteCode: s.inviteCode ? [s.inviteCode] : [],
  };
}

export interface UseSmiles {
  smiles: Smile[];
  isLoading: boolean;
  refresh: () => void;
  deleteSmileLocally: (id: string) => void;
}

export function useSmiles(): UseSmiles {
  const { actor, isFetching } = useActor(createActor);
  const [smiles, setSmiles] = useState<Smile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFetchingRef = useRef(false);

  const fetchSmiles = useCallback(async () => {
    if (!actor || isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const raw = await actor.getSmiles();
      const mapped = raw.map(mapSmile).sort((a, b) => {
        const at = a.createdAt?.seconds ?? 0;
        const bt = b.createdAt?.seconds ?? 0;
        return bt - at;
      });
      setSmiles(mapped);
    } catch {
      // silently ignore polling errors
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [actor]);

  // Initial fetch + 10s polling
  useEffect(() => {
    if (!actor || isFetching) return;

    void fetchSmiles();

    intervalRef.current = setInterval(() => {
      void fetchSmiles();
    }, 10_000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [actor, isFetching, fetchSmiles]);

  const refresh = useCallback(() => {
    void fetchSmiles();
  }, [fetchSmiles]);

  const deleteSmileLocally = useCallback((id: string) => {
    setSmiles((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { smiles, isLoading, refresh, deleteSmileLocally };
}
