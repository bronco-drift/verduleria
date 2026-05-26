import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const globalForPg = globalThis as unknown as {
  pg: ReturnType<typeof postgres> | undefined;
};

const client =
  globalForPg.pg ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") globalForPg.pg = client;

export const db = drizzle(client, { schema });
export type DB = typeof db;
