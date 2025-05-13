export type TrickCard = {
  code: string; // e.g. "3H", "KS"
  position: number; // 0 = me, 1 = left, 2 = across, 3 = right
  order: number; // 0–3 for z-index: 500 + order
};

export type TrickDTO = {
  cards: TrickCard[];
  trickLeaderPosition: number; // 0–3
  winningPosition: number | null; // 0–3 or null if undecided
};
