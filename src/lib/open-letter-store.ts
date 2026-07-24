import { mkdir, readFile, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import type { OpenLetter } from "@/types/open-letter";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "open-letters.json");

let writeQueue = Promise.resolve();

async function readLetters() {
  try {
    const data = await readFile(DATA_FILE, "utf8");
    return JSON.parse(data) as OpenLetter[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLetters(letters: OpenLetter[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(letters, null, 2), "utf8");
}

export async function listOpenLetters() {
  return readLetters();
}

export async function createOpenLetter(
  letter: Omit<OpenLetter, "id" | "createdAt">,
) {
  const operation = writeQueue.then(async () => {
    const letters = await readLetters();
    const created: OpenLetter = {
      ...letter,
      id: `letter-${Date.now()}-${randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    await writeLetters([created, ...letters]);
    return created;
  });

  writeQueue = operation.then(
    () => undefined,
    () => undefined,
  );

  return operation;
}
