export interface User {
  id: string;
  isAiPlayer: boolean;
  isGuest: boolean;
  username: string;
  token: string | null;
  status: string | null;
  scoreTotal: number;
  gamesPlayed: number;
  avgGamePlacement: number;
  moonShots: number;
  perfectGames: number;
  perfectMatches: number;
  currentGameStreak: number;
  longestGameStreak: number;
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
  participantOfActiveMatchId: number | 0;
  participantOfActiveMatchPhase: string | null;
}
