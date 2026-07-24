import { connectMongo } from "@/lib/mongo/connection";
import { PostModel, UserModel } from "@/lib/mongo/models";

type MongoBootstrapCache = {
  ready: Promise<void> | null;
};

const globalForMongoBootstrap = globalThis as typeof globalThis & {
  mongoBootstrapCache?: MongoBootstrapCache;
};

const cache = globalForMongoBootstrap.mongoBootstrapCache ?? {
  ready: null,
};

globalForMongoBootstrap.mongoBootstrapCache = cache;

async function syncMongoSchemas() {
  await Promise.all([
    UserModel.createCollection(),
    PostModel.createCollection(),
  ]);
  await Promise.all([UserModel.syncIndexes(), PostModel.syncIndexes()]);
}

export function ensureMongoReady() {
  cache.ready ??= connectMongo()
    .then(async () => {
      await syncMongoSchemas();
    })
    .catch((error: unknown) => {
      cache.ready = null;
      throw error;
    });

  return cache.ready;
}
