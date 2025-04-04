export interface Match {
  matchId: bigint;
  playerIds: bigint[] | null;
  host: string;
  started: boolean | null;
  invites?: Record<number, number>;
  aiPlayers: number[];
}
