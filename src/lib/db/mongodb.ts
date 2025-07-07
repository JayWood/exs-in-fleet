import { MongoClient, ObjectId } from "mongodb";
import {config} from "dotenv";
config()

const uri = `mongodb://${process.env.MONGO_URL}`;
const client = new MongoClient(uri);

async function connect() {
  try {
    await client.connect();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

async function createDocument(collection: string, document: any) {
  const db = client.db();

  const dbCollection = db.collection(collection);
  try {
    return await dbCollection.insertOne(document);
  } catch (error) {
    console.error("Error inserting document:", error);
  }
}

async function readDocument(filter: Record<string, any>, collection: string) {
  const db = client.db();
  const dbCollection = db.collection(collection);

  try {
    return await dbCollection.findOne(filter);
  } catch (error) {
    console.error("Error finding document:", error);
  }
}

async function updateDocument(
  filter: Record<string, any>,
  collection: string,
  docUpdate: any,
) {
  const db = client.db();

  const dbCollection = db.collection(collection);
  const update = { $set: { ...docUpdate } };

  try {
    const updateResult = await dbCollection.updateOne(filter, update);

    if (updateResult.matchedCount === 0 && updateResult.modifiedCount === 0) {
      // If no documents matched and no documents were modified, it means the document doesn't exist.
      // In this case, create the document.
      return await createDocument(collection, {
        ...docUpdate,
      });
    }

    return updateResult;
  } catch (error) {
    console.error("Error updating document:", error);
  }
}

async function deleteDocument(filter: Record<string, any>, collection: string) {
  const db = client.db();

  const dbCollection = db.collection(collection);
  try {
    return await dbCollection.deleteOne(filter);
  } catch (error) {
    console.error("Error deleting document:", error);
  }
}

async function close() {
  try {
    await client.close();
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
}

export {
  createDocument,
  readDocument,
  updateDocument,
  deleteDocument,
  connect,
  close,
};
