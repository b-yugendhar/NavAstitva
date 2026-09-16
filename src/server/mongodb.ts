import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/navastitva';
const DB_NAME = 'navastitva';

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let isConnected = false;
let connectionAttempted = false;

export async function initMongoDB(): Promise<{ connected: boolean; error?: string }> {
  if (connectionAttempted) {
    return { connected: isConnected };
  }
  connectionAttempted = true;

  try {
    // Attempt connection with a reasonable timeout so we don't stall server startup
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    });

    await client.connect();
    dbInstance = client.db(DB_NAME);
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to ${DB_NAME} at ${MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}`);
    return { connected: true };
  } catch (err: any) {
    isConnected = false;
    console.log(`[MongoDB] Notice: Could not connect to MongoDB (${err?.message || 'Host unreachable'}). Operating on fast active in-memory database with MongoDB ready.`);
    return { connected: false, error: err?.message };
  }
}

export function isMongoConnected(): boolean {
  return isConnected;
}

export function getMongoDb(): Db | null {
  return isConnected ? dbInstance : null;
}

/**
 * Load all items from a MongoDB collection into memory on startup
 */
export async function loadCollection<T>(collectionName: string): Promise<T[]> {
  if (!isConnected || !dbInstance) return [];
  try {
    const docs = await dbInstance.collection(collectionName).find({}).toArray();
    return docs.map(d => {
      const { _id, ...rest } = d;
      return rest as T;
    });
  } catch (err) {
    console.error(`[MongoDB] Error reading collection ${collectionName}:`, err);
    return [];
  }
}

/**
 * Persist an entity to MongoDB (upsert by id)
 */
export async function persistEntity(collectionName: string, entity: { id: string; [key: string]: any }) {
  if (!isConnected || !dbInstance || !entity || !entity.id) return;
  try {
    await dbInstance.collection(collectionName).updateOne(
      { id: entity.id },
      { $set: entity },
      { upsert: true }
    );
  } catch (err) {
    console.error(`[MongoDB] Error persisting to ${collectionName}:`, err);
  }
}

/**
 * Remove an entity from MongoDB
 */
export async function removeEntity(collectionName: string, id: string) {
  if (!isConnected || !dbInstance || !id) return;
  try {
    await dbInstance.collection(collectionName).deleteOne({ id });
  } catch (err) {
    console.error(`[MongoDB] Error deleting from ${collectionName}:`, err);
  }
}
