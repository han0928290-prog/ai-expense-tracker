import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Reuse the connection across hot reloads in dev instead of opening a new one per request.
const globalForMongoose = globalThis as unknown as {
  mongoose?: MongooseCache;
};

const cache: MongooseCache = globalForMongoose.mongoose ?? {
  conn: null,
  promise: null,
};

export async function connectToDatabase() {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI as string);
  }

  cache.conn = await cache.promise;
  globalForMongoose.mongoose = cache;

  return cache.conn;
}
