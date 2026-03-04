import { GameEntry } from "../../types/game";

export type PickStrategy = "random" | "oldest" | "highest-rated";

export function pickNextGame(
  games: GameEntry[],
  strategy: PickStrategy,
): GameEntry | null {
  const backlog = games.filter((g) => g.status === "backlog");
  if (backlog.length === 0) return null;

  switch (strategy) {
    case "random":
      return backlog[Math.floor(Math.random() * backlog.length)];

    case "oldest":
      return backlog.sort((a, b) => a.createdAt - b.createdAt)[0];

    case "highest-rated":
      const rated = backlog.filter((g) => g.personalRating !== null);
      if (rated.length === 0)
        return backlog[Math.floor(Math.random() * backlog.length)];
      return rated.sort(
        (a, b) => (b.personalRating ?? 0) - (a.personalRating ?? 0),
      )[0];
  }
}
