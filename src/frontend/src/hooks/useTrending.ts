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
    views: Number(s.views),
    shares: Number(s.shares),
    profilePicUrl: s.profilePicUrl ?? null,
  };
}

export interface UseTrendingReturn {
  trendingSmiles: Smile[];
  isLoading: boolean;
  refresh: () => void;
}

export function useTrending(): UseTrendingReturn {
  const { actor, isFetching } = useActor(createActor);
  const [trendingSmiles, setTrendingSmiles] = useState<Smile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFetchingRef = useRef(false);

  const fetchTrending = useCallback(async () => {
    if (!actor || isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const raw = await actor.getTrendingSmiles();
      setTrendingSmiles(raw.map(mapSmile));
    } catch {
      // silently ignore polling errors
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [actor]);

  // Initial fetch + 60s polling
  useEffect(() => {
    if (!actor || isFetching) return;

    void fetchTrending();

    intervalRef.current = setInterval(() => {
      void fetchTrending();
    }, 60_000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [actor, isFetching, fetchTrending]);

  const refresh = useCallback(() => {
    void fetchTrending();
  }, [fetchTrending]);

  return { trendingSmiles, isLoading, refresh };
}
