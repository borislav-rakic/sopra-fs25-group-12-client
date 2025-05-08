export type GameData = {
  matchPhase: string;
  gamePhase: string;
  trickPhase: string;
  players: { gameScore: number }[];
  playerPointsString: string;
};

export type DebugOverlayProps = {
  gameData: GameData;
};