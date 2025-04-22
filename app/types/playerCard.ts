export interface PlayerCard {
    gameId: bigint | null;
    playerId: bigint | null;
    card: string;
    gameNumber: number | null;
    cardOrder: number | null;
}