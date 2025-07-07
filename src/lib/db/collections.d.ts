export type User = {
    access_token: string
    refresh_token: string
    expiration: number
    name: string
    playerId: number
    parentPlayerId?: number
}
