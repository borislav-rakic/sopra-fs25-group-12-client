export interface PlayerCard {
    gameId: bigint | null;
    playerId: bigint | null;
    card: innerCard;
    gameNumber: number | null;
    cardOrder: number | null;
}

export interface innerCard{
    cardOrder: number | null;
    code: string;
}