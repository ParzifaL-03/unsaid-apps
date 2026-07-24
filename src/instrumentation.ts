import { ensureMongoReady } from "@/lib/mongo/bootstrap";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      await ensureMongoReady();
    } catch (error) {
      console.error("Mongo bootstrap failed:", error);
    }
  }
}
