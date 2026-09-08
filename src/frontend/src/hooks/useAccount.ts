import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useState } from "react";
import { ExternalBlob, createActor } from "../backend";
import type {
  UserProfile as BackendUserProfile,
  UpdateProfileInput,
} from "../backend";
import type { UserProfile } from "../lib/types";

function mapProfile(p: BackendUserProfile): UserProfile {
  return {
    uid: p.id.toString(),
    name: p.name,
    email: p.email,
    country: p.country,
    tokens: Number(p.tokens),
    totalSmiles: Number(p.totalSmiles),
    unlockedStickers: p.unlockedStickers,
    joinedAt: p.joinedAt
      ? { seconds: Number(p.joinedAt / 1_000_000_000n) }
      : undefined,
    lastPostDate: p.lastPostDate,
    currentStreak: p.currentStreak,
    lastLoginTime: p.lastLoginTime,
    profilePicUrl: p.profilePicUrl ?? null,
    bio: p.bio ?? null,
    phone: p.phone ?? null,
    location: p.location ?? null,
    isPublic: p.isPublic,
    deactivatedAt: p.deactivatedAt ?? null,
    badges: p.badges?.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      icon: b.icon,
      earnedAt: b.earnedAt,
    })),
  };
}

export interface UseAccountReturn {
  isLoading: boolean;
  error: string | null;
  updateProfile: (fields: UpdateProfileInput) => Promise<UserProfile | null>;
  updateProfilePicture: (file: File) => Promise<UserProfile | null>;
  deactivateAccount: () => Promise<string | null>;
  reactivateAccount: () => Promise<string | null>;
  deleteAccount: () => Promise<string | null>;
}

export function useAccount(): UseAccountReturn {
  const { actor, isFetching } = useActor(createActor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(
    async (fields: UpdateProfileInput): Promise<UserProfile | null> => {
      if (!actor || isFetching) return null;
      setIsLoading(true);
      setError(null);
      try {
        const result = await actor.updateProfile(fields);
        if (result.__kind__ === "ok") return mapProfile(result.ok);
        setError(result.err);
        return null;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Update failed";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [actor, isFetching],
  );

  const updateProfilePicture = useCallback(
    async (file: File): Promise<UserProfile | null> => {
      if (!actor || isFetching) return null;
      setIsLoading(true);
      setError(null);
      try {
        // Read file as bytes
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // Use internal _uploadFile/_downloadFile following the same pattern as smile upload
        const actorInternal = actor as unknown as {
          _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>;
          _downloadFile: (hash: Uint8Array) => Promise<ExternalBlob>;
        };

        const externalBlob = ExternalBlob.fromBytes(bytes);
        const hashBytes = await actorInternal._uploadFile(externalBlob);
        const storageBlob = await actorInternal._downloadFile(hashBytes);
        const picUrl = storageBlob.getDirectURL();

        // Store the hash as blobId (hex-encoded bytes)
        const blobId = Array.from(hashBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        const result = await actor.updateProfilePicture(blobId, picUrl);
        if (result.__kind__ === "ok") return mapProfile(result.ok);
        setError(result.err);
        return null;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [actor, isFetching],
  );

  const deactivateAccount = useCallback(async (): Promise<string | null> => {
    if (!actor || isFetching) return null;
    setIsLoading(true);
    setError(null);
    try {
      const result = await actor.deactivateAccount();
      if (result.__kind__ === "ok") return result.ok;
      setError(result.err);
      return null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Deactivation failed";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [actor, isFetching]);

  const reactivateAccount = useCallback(async (): Promise<string | null> => {
    if (!actor || isFetching) return null;
    setIsLoading(true);
    setError(null);
    try {
      const result = await actor.reactivateAccount();
      if (result.__kind__ === "ok") return result.ok;
      setError(result.err);
      return null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Reactivation failed";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [actor, isFetching]);

  const deleteAccount = useCallback(async (): Promise<string | null> => {
    if (!actor || isFetching) return null;
    setIsLoading(true);
    setError(null);
    try {
      const result = await actor.deleteAccount();
      if (result.__kind__ === "ok") return result.ok;
      setError(result.err);
      return null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Deletion failed";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [actor, isFetching]);

  return {
    isLoading,
    error,
    updateProfile,
    updateProfilePicture,
    deactivateAccount,
    reactivateAccount,
    deleteAccount,
  };
}
