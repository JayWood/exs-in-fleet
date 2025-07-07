import {
    COLLECTION_USERS,
    EvePayload,
    refreshToken,
    UserRecord,
} from '@/lib/eve-auth'
import { createDocument, readDocument, updateDocument } from './mongodb'
import { WithId } from 'mongodb'
import { User } from '@/lib/db/collections'

export const updateUser = async (
    decoded: EvePayload,
    access_token: string,
    refresh_token: string,
    parentPlayerId?: number
) => {
    const sub = decoded.sub.split(':')
    const playerId = parseInt(sub[sub.length - 1])

    // Now write the document.
    const document = {
        access_token,
        refresh_token,
        expiration: decoded.exp as number,
        name: decoded.name,
        playerId,
        parentPlayerId,
    }

    return await updateDocument(
        { playerId: playerId },
        COLLECTION_USERS,
        document as User
    )
}

/**
 * Gets the EvE Online Access token for a user if one is on file.
 * @param userID
 */
export const getUserToken = async (userID: number) => {
    const userRecord = await readDocument(
        { playerId: userID },
        COLLECTION_USERS
    )

    if (!userRecord) {
        throw new Error('Error for user.')
    }

    return userRecord as WithId<UserRecord>
}
