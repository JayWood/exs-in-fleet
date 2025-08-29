import { OptionalUnlessRequiredId, WithId } from 'mongodb'
import clientPromise from '@/lib/db/mongodb'

async function createOne<T extends Document>(
  collection: string,
  doc: OptionalUnlessRequiredId<T>
) {
  const client = await clientPromise
  const db = client.db()
  return db.collection<T>(collection).insertOne(doc)
}

async function readOne<T extends {}>(
  collection: string,
  filter: Record<string, any>,
  projection?: Record<string, 1 | 0>
): Promise<WithId<T> | null> {
  const client = await clientPromise
  const db = client.db()
  return db.collection<T>(collection).findOne(filter, { projection })
}

async function readMany<T extends {}>(
  collection: string,
  filter: Record<string, any>,
  projection?: Record<string, 1 | 0>
): Promise<WithId<T>[]> {
  const client = await clientPromise
  const db = client.db()
  return db.collection<T>(collection).find(filter, { projection }).toArray()
}

async function updateOne<T extends Document>(
  collection: string,
  filter: Record<string, any>,
  update: Partial<T>,
  options: { upsert?: boolean } = {}
) {
  const client = await clientPromise
  const db = client.db()
  return db
    .collection<T>(collection)
    .updateOne(filter, { $set: update }, options)
}

async function deleteOne(collection: string, filter: Record<string, any>) {
  const client = await clientPromise
  const db = client.db()
  return db.collection(collection).deleteOne(filter)
}

async function writeMany(collection: string, docs: any[]) {
  const client = await clientPromise
  const db = client.db()
  return db.collection(collection).insertMany(docs)
}

async function collectionExists(collection: string): Promise<boolean> {
  const client = await clientPromise
  const db = client.db()
  const collections = await db.listCollections({ name: collection }).toArray()
  return collections.length > 0
}

async function createCollection(
  collection: string,
  indexes?: any
): Promise<void> {
  const client = await clientPromise
  const db = client.db()

  if (!(await collectionExists(collection))) {
    await db.createCollection(collection)
    if (indexes?.length) {
      const col = db.collection(collection)
      for (const index of indexes) {
        await col.createIndex(index.key, index.options)
      }
    }
  }
}

/**
 * Accepts an array of fields to return from a document and creates a projection object for those fields.
 * @param fields
 */
function createProjection<T extends object>(
  fields: (keyof T)[]
): Record<keyof T, 1> {
  return fields.reduce(
    (proj, field) => {
      proj[field] = 1
      return proj
    },
    {} as Record<keyof T, 1>
  )
}

export {
  createProjection,
  createOne,
  readOne,
  readMany,
  writeMany,
  updateOne,
  deleteOne,
  collectionExists,
  createCollection
}
