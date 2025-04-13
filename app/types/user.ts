export interface User {
  id: string;
  isAiPlayer: boolean;
  isGuest: boolean;
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

export interface UserAuthDTO {
  id: number;
  username: string;
  token: string;
  status: "ONLINE" | "OFFLINE";
  avatar: number;
  isGuest: boolean;
}

export interface UserPrivateDTO {
  id: number;
  username: string;
  status: "ONLINE" | "OFFLINE";
  avatar: number;
  birthday: string;
  userSettings: string;
  isGuest: boolean;
}
