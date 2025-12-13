import { drizzle } from "drizzle-orm/d1";
import * as schema from "@auto-landlord/shared";

export const createDb = (d1: D1Database) => {
  return drizzle(d1, { schema });
};
