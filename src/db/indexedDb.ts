import { openDB } from "idb";
import { UserProgress } from "../data/types";

const DB_NAME = "photo-foundation";
const STORE_NAME = "progress";
const DB_VERSION = 1;

const getDb = () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "lessonId" });
      }
    }
  });

export const getProgress = async (lessonId: string) => {
  const db = await getDb();
  return db.get(STORE_NAME, lessonId);
};

export const saveProgress = async (progress: UserProgress) => {
  const db = await getDb();
  await db.put(STORE_NAME, progress);
};

export const listAllProgress = async () => {
  const db = await getDb();
  return db.getAll(STORE_NAME);
};

export const listAchievements = async () => {
  const all = await listAllProgress();
  return all.filter((progress) => progress.mastered);
};
