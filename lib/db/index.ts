import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL est absente de l'environnement.");
    this.name = "DatabaseNotConfiguredError";
  }
}

let instance: NeonHttpDatabase<typeof schema> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new DatabaseNotConfiguredError();
  instance ??= drizzle(neon(url), { schema });
  return instance;
}

export { schema };
