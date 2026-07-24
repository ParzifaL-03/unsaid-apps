import mongoose from "mongoose";
import { getMongoEnv } from "@/server/env";

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  unsaidMongoose?: MongooseCache;
};

const cache = globalForMongoose.unsaidMongoose ?? {
  connection: null,
  promise: null,
};

globalForMongoose.unsaidMongoose = cache;
mongoose.set("bufferCommands", false);

export async function connectMongo() {
  if (cache.connection && mongoose.connection.readyState === 1) {
    return cache.connection;
  }

  if (!cache.promise) {
    const { MONGODB_URI } = getMongoEnv();
    cache.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5_000,
      autoIndex: false,
    });
  }

  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (error) {
    cache.connection = null;
    cache.promise = null;
    throw error;
  }
}
