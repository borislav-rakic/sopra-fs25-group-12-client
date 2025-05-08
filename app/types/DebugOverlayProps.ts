type GameData = {
  matchPhase: string;
  gamePhase: string;
  trickPhase: string;
  players: { gameScore: number }[];
};

type DebugOverlayProps = {
  gameData: GameData;
};
