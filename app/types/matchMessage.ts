// types/MatchMessage.ts (or @/types/MatchMessage.ts)

export enum MatchMessageType {
  INFO = "INFO",
  WARNING = "WARNING",
  GAME_ENDED = "GAME_ENDED",
  QUEEN_WARNING = "QUEEN_WARNING",
  // Add all other types from your backend enum
}

export interface MatchMessage {
  id: string;
  type: MatchMessageType;
  content: string;
  createdAt: string; // ISO string from Instant
}
