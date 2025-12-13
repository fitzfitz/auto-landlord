import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { applicationSchema } from "@auto-landlord/shared";
import { createDb } from "../../db";
import { ApplicationsService } from "./applications.service";

const app = new Hono<{ Bindings: { DB: D1Database } }>();

// Public route for submitting applications
app.post("/", zValidator("json", applicationSchema), async (c) => {
  const data = c.req.valid("json");
  const db = createDb(c.env.DB);
  const service = new ApplicationsService(db);
  const result = await service.create(data);
  return c.json(result, 201);
});

export default app;
