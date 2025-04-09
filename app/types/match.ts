export interface Match {
  matchId: bigint;
  playerIds: bigint[] | null;
  host: string;
  started: boolean | null;
  invites?: Record<number, number>;
  aiPlayers: number[];
  joinRequests?: Array<{ userId: number }>;
  player1Id?: number | null;
  player2Id?: number | null;
  player3Id?: number | null;
  player4Id?: number | null;
}
