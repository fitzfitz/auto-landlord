import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { ticketSchema, updateTicketStatusSchema } from "@auto-landlord/shared";
import { createDb } from "../../db";
import { TicketsService } from "./tickets.service";
import { requireAuth, getUserId } from "../../middleware/auth";
import type { AppEnv } from "../../types/bindings";

const app = new OpenAPIHono<AppEnv>();

app.use("*", requireAuth);

const routeConfig = {
  security: [{ bearerAuth: [] }],
  tags: ["Tickets"],
};

// GET /
app.openapi(
  createRoute({
    ...routeConfig,
    method: "get",
    path: "/",
    summary: "List my tickets",
    responses: {
      200: {
        description: "List of tickets",
        content: {
          "application/json": {
            schema: z.array(ticketSchema),
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const userId = getUserId(c);
    const db = createDb(c.env.DB);
    const service = new TicketsService(db);
    const result = await service.findAll(userId);
    return c.json(result);
  }
);

// POST /
app.openapi(
  createRoute({
    ...routeConfig,
    method: "post",
    path: "/",
    summary: "Create a ticket",
    request: {
      body: {
        content: {
          "application/json": {
            schema: ticketSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Created ticket",
        content: {
          "application/json": {
            schema: ticketSchema.extend({ id: z.string() }),
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const userId = getUserId(c);
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);
    const service = new TicketsService(db);
    const result = await service.create(data, userId);
    return c.json(result, 201);
  }
);

// PATCH /:id/status
app.openapi(
  createRoute({
    ...routeConfig,
    method: "patch",
    path: "/{id}/status",
    summary: "Update ticket status",
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          "application/json": {
            schema: updateTicketStatusSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Updated ticket status",
        content: {
          "application/json": {
            schema: ticketSchema,
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);
    const service = new TicketsService(db);
    const result = await service.updateStatus(id, data);
    return c.json(result);
  }
);

export default app;
