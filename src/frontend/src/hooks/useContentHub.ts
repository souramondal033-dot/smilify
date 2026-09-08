import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useState } from "react";
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

export type DateRange = "week" | "month" | "all";

export interface SmileAnalytics {
  views: number;
  likes: number;
  shares: number;
}

export interface UseContentHubReturn {
  smiles: Smile[];
  filteredSmiles: Smile[];
  isLoading: boolean;
  error: string | null;
  selectedIds: Set<string>;
  searchQuery: string;
  dateRange: DateRange;
  setSearchQuery: (q: string) => void;
  setDateRange: (r: DateRange) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  loadMySmiles: () => Promise<void>;
  getSmileAnalytics: (id: string) => Promise<SmileAnalytics | null>;
  deleteSmile: (id: string) => Promise<boolean>;
  bulkDeleteSmiles: (ids: string[]) => Promise<number | null>;
}

export function useContentHub(): UseContentHubReturn {
  const { actor, isFetching } = useActor(createActor);
  const [smiles, setSmiles] = useState<Smile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("all");

  // Derived filtered list from smiles, searchQuery, dateRange
  const filteredSmiles = smiles.filter((s) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.country.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (dateRange === "all") return true;

    const nowSec = Date.now() / 1000;
    const createdSec = s.createdAt?.seconds ?? 0;
    if (dateRange === "week") return nowSec - createdSec <= 7 * 86400;
    if (dateRange === "month") return nowSec - createdSec <= 30 * 86400;
    return true;
  });

  const loadMySmiles = useCallback(async (): Promise<void> => {
    if (!actor || isFetching) return;
    setIsLoading(true);
    setError(null);
    try {
      const raw = await actor.getMySmiles();
      const mapped = raw.map(mapSmile).sort((a, b) => {
        const at = a.createdAt?.seconds ?? 0;
        const bt = b.createdAt?.seconds ?? 0;
        return bt - at;
      });
      setSmiles(mapped);
      // Clear selection when reloading
      setSelectedIds(new Set());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load smiles";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [actor, isFetching]);

  const getSmileAnalytics = useCallback(
    async (id: string): Promise<SmileAnalytics | null> => {
      if (!actor || isFetching) return null;
      try {
        const result = await actor.getSmileAnalytics(id);
        if (result.__kind__ === "ok") {
          return {
            views: Number(result.ok.views),
            likes: Number(result.ok.likes),
            shares: Number(result.ok.shares),
          };
        }
        return null;
      } catch {
        return null;
      }
    },
    [actor, isFetching],
  );

  const deleteSmile = useCallback(
    async (id: string): Promise<boolean> => {
      if (!actor || isFetching) return false;
      setIsLoading(true);
      setError(null);
      try {
        const result = await actor.deleteSmile(id);
        if (result.__kind__ === "ok") {
          setSmiles((prev) => prev.filter((s) => s.id !== id));
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          return true;
        }
        setError("Failed to delete smile");
        return false;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Delete failed";
        setError(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [actor, isFetching],
  );

  const bulkDeleteSmiles = useCallback(
    async (ids: string[]): Promise<number | null> => {
      if (!actor || isFetching || ids.length === 0) return null;
      setIsLoading(true);
      setError(null);
      try {
        const result = await actor.bulkDeleteSmiles(ids);
        if (result.__kind__ === "ok") {
          const deletedCount = Number(result.ok);
          setSmiles((prev) => prev.filter((s) => !ids.includes(s.id)));
          setSelectedIds(new Set());
          return deletedCount;
        }
        setError(result.err);
        return null;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Bulk delete failed";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [actor, isFetching],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredSmiles.map((s) => s.id)));
  }, [filteredSmiles]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    smiles,
    filteredSmiles,
    isLoading,
    error,
    selectedIds,
    searchQuery,
    dateRange,
    setSearchQuery,
    setDateRange,
    toggleSelect,
    selectAll,
    clearSelection,
    loadMySmiles,
    getSmileAnalytics,
    deleteSmile,
    bulkDeleteSmiles,
  };
}
