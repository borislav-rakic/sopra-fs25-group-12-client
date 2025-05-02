import { PlayerCard } from "../types/playerCard";
import { innerCard } from "../types/playerCard"; // assuming Card = innerCard in TS

export interface PollingDTO {
  // Match context
  matchId: number | null; // Long in Java
  matchGoal: number | null;
  hostId: number | null;
  matchPhase: string | null; // MatchPhase enum

  // Game state
  gamePhase: string | null; // GamePhase enum
  trickInProgress: boolean | null;
  heartsBroken: boolean | null;

  currentTrick: Array<innerCard> | null;
  currentTrickLeaderMatchPlayerSlot: number | null;
  currentTrickLeaderPlayerSlot: number | null;

  previousTrick: Array<innerCard> | null;
  previousTrickWinnerMatchPlayerSlot: number | null;
  previousTrickWinnerPlayerSlot: number | null;
  previousTrickPoints: number | null;
  resultHtml: string | null; // HTML string

  // Other players
  matchPlayers: Array<string> | null;
  avatarUrls: Array<string> | null;
  cardsInHandPerPlayer: { [key: number]: number } | null; // Map<Integer, Integer>
  playerPoints: { [key: number]: number } | null; // Map<Integer, Integer>
  aiPlayers: { [key: number]: number } | null; // Map<Integer, Integer>

  // Myself
  matchPlayerSlot: number | null;
  playerSlot: number | null;
  myTurn: boolean | null;
  playerCards: Array<PlayerCard> | null;
  playableCards: Array<PlayerCard> | null;
}
