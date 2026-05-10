const DICEBEAR_BASE_URL = "https://api.dicebear.com/9.x/pixel-art/png";

export function generateAvatarUrl(
  username: string | null | undefined,
  displayName: string | null | undefined,
): string {
  let seed = username;

  if (!seed) {
    seed = displayName;
  }

  if (!seed) {
    seed = "user";
  }

  const encodedSeed = encodeURIComponent(seed);
  return `${DICEBEAR_BASE_URL}?seed=${encodedSeed}`;
}
