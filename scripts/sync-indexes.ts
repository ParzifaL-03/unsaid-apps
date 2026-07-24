import { connectMongo } from "../src/server/db/connect";
import { databaseModels } from "../src/server/db/models";

async function main() {
  const connection = await connectMongo();
  for (const databaseModel of databaseModels) {
    await databaseModel.syncIndexes();
    console.log(`Synced indexes for ${databaseModel.collection.name}`);
  }
  await connection.disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
