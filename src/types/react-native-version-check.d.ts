declare module "react-native-version-check" {
  interface VersionCheckOptions {
    packageName?: string;
    appID?: string;
    bundleId?: string;
    country?: string;
    ignoreErrors?: boolean;
  }

  interface NeedUpdateResult {
    isNeeded: boolean;
    currentVersion: string;
    latestVersion: string;
    storeUrl: string;
  }

  const VersionCheck: {
    getCurrentVersion(): string;
    getLatestVersion(options?: VersionCheckOptions): Promise<string>;
    getStoreUrl(options?: VersionCheckOptions): Promise<string>;
    needUpdate(options?: VersionCheckOptions): Promise<NeedUpdateResult | null>;
  };

  export default VersionCheck;
}
