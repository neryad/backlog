import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VersionCheck from "react-native-version-check";

const DISMISSED_KEY = "@playlogged/update_dismissed_at";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

// iOS App Store ID from App Store Connect (numeric id in the URL)
const IOS_APP_ID = "6760157713";

const FALLBACK_STORE_URL =
  Platform.OS === "ios"
    ? `https://apps.apple.com/app/id${IOS_APP_ID}`
    : "https://play.google.com/store/apps/details?id=com.neryad.playlogged";

function getMajor(version: string): number {
  return parseInt(version.split(".")[0] ?? "0", 10);
}

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function isValidVersion(v: unknown): v is string {
  return typeof v === "string" && /^\d+\.\d+/.test(v);
}

export type UpdateCheckResult = {
  isUpdateAvailable: boolean;
  /** true when the major version changed (e.g. 1.x → 2.x) */
  isForceUpdate: boolean;
  storeUrl: string;
  shouldShowModal: boolean;
  dismissModal: () => Promise<void>;
};

export function useAppUpdateCheck(): UpdateCheckResult {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isForceUpdate, setIsForceUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");
  const [shouldShowModal, setShouldShowModal] = useState(false);

  const dismissModal = useCallback(async () => {
    setShouldShowModal(false);
    try {
      await AsyncStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // Fetch current and latest versions independently so a null in
        // either one doesn't crash the whole check.
        const platformOptions =
          Platform.OS === "ios"
            ? { appID: IOS_APP_ID }
            : { packageName: "com.neryad.playlogged" };

        let current: string | null = null;
        try {
          current = VersionCheck.getCurrentVersion();
        } catch {
          /* native not ready */
        }

        const [latest, url] = await Promise.all([
          VersionCheck.getLatestVersion(platformOptions).catch(() => null),
          VersionCheck.getStoreUrl(platformOptions).catch(
            () => FALLBACK_STORE_URL,
          ),
        ]);

        if (cancelled) return;
        if (!isValidVersion(current) || !isValidVersion(latest)) return;

        const updateAvailable = compareVersions(latest, current) > 0;

        if (!updateAvailable) return;

        const resolvedUrl =
          typeof url === "string" && url ? url : FALLBACK_STORE_URL;
        const forceMajor = getMajor(latest) > getMajor(current);

        setIsUpdateAvailable(true);
        setIsForceUpdate(forceMajor);
        setStoreUrl(resolvedUrl);

        // Major version bumps bypass the cooldown — always prompt.
        if (forceMajor) {
          setShouldShowModal(true);
          return;
        }

        const raw = await AsyncStorage.getItem(DISMISSED_KEY);
        const lastDismissed = raw ? parseInt(raw, 10) : 0;
        if (Date.now() - lastDismissed > COOLDOWN_MS) {
          setShouldShowModal(true);
        }
      } catch {
        // Silent fallback — never break the app on a failed store check.
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    isUpdateAvailable,
    isForceUpdate,
    storeUrl,
    shouldShowModal,
    dismissModal,
  };
}
