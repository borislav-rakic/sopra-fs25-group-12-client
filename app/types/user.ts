export interface User {
  id: string;
  username: string;
  token: string | null;
  status: string | null;
  scoreTotal: number;
  gamesPlayed: number;
  avgPlacement: number;
  moonShots: number;
  perfectGames: number;
  perfectMatches: number;
  currentStreak: number;
  longestStreak: number;
}
