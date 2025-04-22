export interface PlayerCard {
    gameId: bigint | null;
    playerId: bigint | null;
    card: string | null;
    gameNumber: number | null;
    cardOrder: number | null;
}