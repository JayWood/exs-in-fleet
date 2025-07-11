import { OptionalUnlessRequiredId, WithId } from "mongodb";
import clientPromise from "@/lib/db/mongodb";

async function createOne<T extends {}>(
    collection: string,
    doc: OptionalUnlessRequiredId<T>
) {
    const client = await clientPromise;
    const db = client.db();
    return db.collection<T>(collection).insertOne(doc)
}

async function readOne<T extends {}>(
    collection: string,
    filter: Record<string, any>,
    projection?: Record<string, 1 | 0>
): Promise<WithId<T> | null> {
    const client = await clientPromise;
    const db = client.db();
    return db.collection<T>(collection).findOne(filter, { projection })
}

async function readMany<T extends {}>(
    collection: string,
    filter: Record<string, any>,
    projection?: Record<string, 1 | 0>
): Promise<WithId<T>[]> {
    const client = await clientPromise;
    const db = client.db();
    return db.collection<T>(collection).find(filter, { projection }).toArray()
}

async function updateOne<T extends {}>(
    collection: string,
    filter: Record<string, any>,
    update: Partial<T>
) {
    const client = await clientPromise;
    const db = client.db();
    return db.collection<T>(collection).updateOne(filter, { $set: update })
}

async function deleteOne(
    collection: string,
    filter: Record<string, any>
) {
    const client = await clientPromise;
    const db = client.db();
    return db.collection(collection).deleteOne(filter)
}


export {
    createOne,
    readOne,
    readMany,
    updateOne,
    deleteOne,
};