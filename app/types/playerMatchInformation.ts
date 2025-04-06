// interface Dictionary {
//     [Key: number]: String;
// }

export interface PlayerMatchInformation {
    aiPlayers: Array<number> | null;
    host: String | null;
    length: number | null;
    matchId: bigint | null;
    matchPlayers: Array<String | null> | null
    started: boolean | null
}