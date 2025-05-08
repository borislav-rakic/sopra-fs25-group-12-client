import { PlayerCard } from "../types/playerCard";
import { innerCard } from "../types/playerCard"; // assuming Card = innerCard in TS
import { TrickDTO } from "../types/trick"; // assuming Trick = trick in TS

export type TrickPhase = "READY" | "RUNNING" | "JUSTCOMPLETED";
import { MatchMessage } from "./matchMessage";

export interface PollingDTO {
  // Match context
  matchId: number | null; // Long in Java
  matchGoal: number | null;
  hostId: number | null;
  matchPhase: string | null; // MatchPhase enum
  trickPhase: TrickPhase; // TrickPhase enum

  // Game state
  gamePhase: string | null; // GamePhase enum
  heartsBroken: boolean | null;

  currentTrick: Array<innerCard> | null;
  currentTrickLeaderMatchPlayerSlot: number | null;
  currentTrickLeaderPlayerSlot: number | null;
  currentTrickDTO: TrickDTO | null; // TrickDTO object

  previousTrick: Array<innerCard> | null;
  previousTrickWinnerMatchPlayerSlot: number | null;
  previousTrickWinnerPlayerSlot: number | null;
  previousTrickLeaderPlayerSlot: number | null;
  previousTrickPoints: number | null;
  resultHtml: string | null; // HTML string
  matchMessages: MatchMessage[] | null;

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
