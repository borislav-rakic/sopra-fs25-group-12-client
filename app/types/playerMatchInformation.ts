// interface Dictionary {
//     [Key: number]: String;
// }

export interface PlayerMatchInformation {
  aiPlayers: Array<number> | null;
  host: string | null;
  length: number | null;
  matchId: bigint | null;
  matchPlayers: Array<string | null> | null;
  started: boolean | null;
}
