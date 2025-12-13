import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { propertySchema } from "@auto-landlord/shared";
import { createDb } from "../../db";
import { PropertiesService } from "./properties.service";
import { requireAuth, getUserId } from "../../middleware/auth";
import type { AppEnv } from "../../types/bindings";

const app = new OpenAPIHono<AppEnv>();

// Public routes (no auth required) - must come BEFORE auth middleware
// GET /public - List all publicly listed properties
app.openapi(
  createRoute({
    method: "get",
    path: "/public",
    summary: "List all publicly available properties",
    tags: ["Public Properties"],
    responses: {
      200: {
        description: "List of publicly listed properties",
        content: {
          "application/json": {
            schema: z.array(propertySchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DB);
    const service = new PropertiesService(db);
    const result = await service.findAllPublic();
    return c.json(result);
  }
);

// GET /public/:slug - Get a single public property by slug
app.openapi(
  createRoute({
    method: "get",
    path: "/public/{slug}",
    summary: "Get a public property by slug",
    tags: ["Public Properties"],
    request: {
      params: z.object({ slug: z.string() }),
    },
    responses: {
      200: {
        description: "Property details",
        content: {
          "application/json": {
            schema: propertySchema,
          },
        },
      },
      404: { description: "Property not found" },
    },
  }),
  async (c) => {
    const slug = c.req.param("slug");
    const db = createDb(c.env.DB);
    const service = new PropertiesService(db);
    const result = await service.findBySlug(slug);

    if (!result) return c.json({ error: "Property not found" }, 404);
    return c.json(result);
  }
);

// All property routes below require auth
app.use("*", requireAuth);

const routeConfig = {
  security: [{ bearerAuth: [] }],
  tags: ["Properties"],
};

// GET /
app.openapi(
  createRoute({
    ...routeConfig,
    method: "get",
    path: "/",
    summary: "List all properties",
    responses: {
      200: {
        description: "List of properties",
        content: {
          "application/json": {
            schema: z.array(propertySchema),
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const userId = getUserId(c);
    const db = createDb(c.env.DB);
    const service = new PropertiesService(db);
    const result = await service.findAll(userId);
    return c.json(result);
  }
);

// GET /:id
app.openapi(
  createRoute({
    ...routeConfig,
    method: "get",
    path: "/{id}",
    summary: "Get a property by ID",
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        description: "Property details",
        content: {
          "application/json": {
            schema: propertySchema,
          },
        },
      },
      404: { description: "Not found" },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const userId = getUserId(c);
    const id = c.req.param("id");
    const db = createDb(c.env.DB);
    const service = new PropertiesService(db);
    const result = await service.findOne(id, userId);

    if (!result) return c.json({ error: "Not found" }, 404);
    return c.json(result);
  }
);

// POST /
app.openapi(
  createRoute({
    ...routeConfig,
    method: "post",
    path: "/",
    summary: "Create a property",
    request: {
      body: {
        content: {
          "application/json": {
            schema: propertySchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Created property",
        content: {
          "application/json": {
            schema: propertySchema.extend({ id: z.string() }),
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
    const service = new PropertiesService(db);
    const result = await service.create(data, userId);

    return c.json(result, 201);
  }
);

// PATCH /:id
app.openapi(
  createRoute({
    ...routeConfig,
    method: "patch",
    path: "/{id}",
    summary: "Update a property",
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          "application/json": {
            schema: propertySchema.partial(),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Updated property",
        content: {
          "application/json": {
            schema: propertySchema,
          },
        },
      },
      404: { description: "Not found" },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const userId = getUserId(c);
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);
    const service = new PropertiesService(db);
    const result = await service.update(id, userId, data);

    if (!result) return c.json({ error: "Not found" }, 404);
    return c.json(result);
  }
);

// DELETE /:id
app.openapi(
  createRoute({
    ...routeConfig,
    method: "delete",
    path: "/{id}",
    summary: "Delete a property",
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        description: "Deleted successfully",
        content: {
          "application/json": {
            schema: z.object({ success: z.boolean() }),
          },
        },
      },
      404: { description: "Not found" },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const userId = getUserId(c);
    const id = c.req.param("id");
    const db = createDb(c.env.DB);
    const service = new PropertiesService(db);
    const success = await service.delete(id, userId);

    if (!success) return c.json({ error: "Not found" }, 404);
    return c.json({ success: true });
  }
);

// POST /:id/images - Add images to a property
app.openapi(
  createRoute({
    ...routeConfig,
    method: "post",
    path: "/{id}/images",
    summary: "Add images to a property",
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              images: z.array(
                z.object({
                  url: z.string(),
                  key: z.string().optional(),
                  size: z.number().optional(),
                })
              ),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Images added successfully",
        content: {
          "application/json": {
            schema: z.array(
              z.object({
                id: z.string(),
                url: z.string(),
                propertyId: z.string(),
                order: z.number(),
              })
            ),
          },
        },
      },
      404: { description: "Property not found" },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const userId = getUserId(c);
    const propertyId = c.req.param("id");
    const { images } = c.req.valid("json");
    const db = createDb(c.env.DB);
    const service = new PropertiesService(db);

    const result = await service.addImages(propertyId, userId, images);

    if (!result) return c.json({ error: "Property not found" }, 404);
    return c.json(result, 201);
  }
);

export default app;
