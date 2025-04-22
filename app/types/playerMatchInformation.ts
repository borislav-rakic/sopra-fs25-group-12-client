// interface Dictionary {
//     [Key: number]: String;
// }

export interface PlayerCard {
  gameId: number; // Game ID as an integer
  playerId: number; // Player ID as an integer
  card: string; // Card as a string
}

export interface PlayerMatchInformation {
  aiPlayers: Array<number> | null;
  host: string | null;
  length: number | null;
  matchId: bigint | null;
  matchPlayers: Array<string | null> | null;
  started: boolean | null;
  playerCards: Array<PlayerCard> | null;
}
