import {
    COLLECTION_USERS,
    EvePayload,
    refreshToken,
    UserRecord,
} from '@/lib/authEveOnline'
import { WithId } from 'mongodb'
import {User, UserDocument, UserInsert} from '@/lib/db/collections'
import {readOne, updateOne} from "@/lib/db/mongoHelpers";

export const collection: string = 'eveUsers';

export const updateUser = async (
    decoded: EvePayload,
    access_token: string,
    refresh_token: string,
    parentPlayerId?: number
) => {
    const sub = decoded.sub.split(':')
    const playerId = parseInt(sub[sub.length - 1])

    // Now write the document.
    const document: UserInsert = {
        access_token,
        refresh_token,
        expiration: decoded.exp as number,
        name: decoded.name,
        playerId,
        parentPlayerId,
    }

    return await updateOne<UserInsert>( collection, { playerId }, document, { upsert: true } )
}

/**
 * Gets the EvE Online Access token for a user if one is on file.
 * @param playerId
 */
export const getUserToken = async (playerId: number): Promise<UserDocument | null> => {
    const userRecord = await readOne<UserDocument | null>( collection, { playerId } );

    if (!userRecord) {
        throw new Error('Error for user.')
    }

    return userRecord;
}
