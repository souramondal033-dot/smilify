// ── useGeolocation hook ───────────────────────────────────────────────────────
// Fetches reverse-geocoded location via BigDataCloud (no API key needed).
// Never blocks, never throws — failures return null.

import { useRef } from "react";

export interface GeoLocation {
  region: string; // city / locality
  state: string; // principalSubdivision
  country: string; // countryName
}

const LS_ASKED_KEY = "pookie_location_asked";

interface BigDataCloudResponse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
}

async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<GeoLocation | null> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as BigDataCloudResponse;
    const region = data.city ?? data.locality ?? "";
    const state = data.principalSubdivision ?? "";
    const country = data.countryName ?? "";
    if (!country) return null;
    return { region, state, country };
  } catch {
    return null;
  }
}

function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 8000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

/**
 * Returns a function that resolves the user's location (max 3s wait).
 * On first call: requests browser geolocation permission.
 * Subsequent calls reuse a cached result for the session.
 * Always resolves — failures return null.
 */
export function useGeolocation() {
  const cacheRef = useRef<GeoLocation | null | "pending">(null);

  const getLocation = async (): Promise<GeoLocation | null> => {
    // Return cached result if already fetched
    if (cacheRef.current && cacheRef.current !== "pending") {
      return cacheRef.current;
    }

    cacheRef.current = "pending";

    const alreadyAsked = localStorage.getItem(LS_ASKED_KEY);
    if (alreadyAsked === "denied") {
      cacheRef.current = null;
      return null;
    }

    try {
      // Race: location vs 3-second timeout
      const result = await Promise.race<GeoLocation | null>([
        (async () => {
          try {
            localStorage.setItem(LS_ASKED_KEY, "asked");
            const pos = await getBrowserPosition();
            const geo = await reverseGeocode(
              pos.coords.latitude,
              pos.coords.longitude,
            );
            return geo;
          } catch (err) {
            // Check if user denied
            if (err instanceof GeolocationPositionError && err.code === 1) {
              localStorage.setItem(LS_ASKED_KEY, "denied");
            }
            return null;
          }
        })(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);

      cacheRef.current = result;
      return result;
    } catch {
      cacheRef.current = null;
      return null;
    }
  };

  return { getLocation };
}
