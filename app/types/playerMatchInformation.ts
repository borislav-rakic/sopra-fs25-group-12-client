import { PlayerCard } from "../types/playerCard";

export interface PlayerMatchInformation {
  aiPlayers: Array<number> | null;
  host: string | null;
  length: number | null;
  matchId: bigint | null;
  matchPlayers: Array<string | null> | null;
  started: boolean | null;
  playerCards: Array<PlayerCard> | null;
  isGameFinished: boolean | null;
  isMatchFinished: boolean | null;
  isMyTurn: boolean | null;
}
