import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { tenantSchema } from "@auto-landlord/shared";
import { createDb } from "../../db";
import { TenantsService } from "./tenants.service";
import { requireAuth, getUserId } from "../../middleware/auth";
import type { AppEnv } from "../../types/bindings";

const app = new OpenAPIHono<AppEnv>();

app.use("*", requireAuth);

const routeConfig = {
  security: [{ bearerAuth: [] }],
  tags: ["Tenants"],
};

// Response schema for tenant with relations
const tenantResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  propertyId: z.string(),
  leaseStart: z.string().or(z.date()),
  leaseEnd: z.string().or(z.date()),
  user: z
    .object({
      id: z.string(),
      email: z.string(),
      name: z.string().nullable(),
    })
    .optional(),
  property: z
    .object({
      id: z.string(),
      address: z.string(),
      city: z.string(),
      state: z.string(),
    })
    .optional(),
});

// GET / - List all tenants for landlord
app.openapi(
  createRoute({
    ...routeConfig,
    method: "get",
    path: "/",
    summary: "List all tenants for your properties",
    responses: {
      200: {
        description: "List of tenants",
        content: {
          "application/json": {
            schema: z.array(tenantResponseSchema),
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const userId = getUserId(c);
    const db = createDb(c.env.DB);
    const service = new TenantsService(db);
    const tenants = await service.findAllForLandlord(userId);
    return c.json(tenants);
  }
);

// GET /property/:propertyId - List tenants for a specific property
app.openapi(
  createRoute({
    ...routeConfig,
    method: "get",
    path: "/property/{propertyId}",
    summary: "List tenants for a specific property",
    request: {
      params: z.object({ propertyId: z.string() }),
    },
    responses: {
      200: {
        description: "List of tenants",
        content: {
          "application/json": {
            schema: z.array(tenantResponseSchema),
          },
        },
      },
      404: { description: "Property not found" },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const userId = getUserId(c);
    const propertyId = c.req.param("propertyId");
    const db = createDb(c.env.DB);
    const service = new TenantsService(db);
    const tenants = await service.findByProperty(propertyId, userId);

    if (tenants === null) {
      return c.json({ error: "Property not found" }, 404);
    }
    return c.json(tenants);
  }
);

// GET /:id - Get single tenant
app.openapi(
  createRoute({
    ...routeConfig,
    method: "get",
    path: "/{id}",
    summary: "Get a tenant by ID",
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        description: "Tenant details",
        content: {
          "application/json": {
            schema: tenantResponseSchema,
          },
        },
      },
      404: { description: "Tenant not found" },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const userId = getUserId(c);
    const id = c.req.param("id");
    const db = createDb(c.env.DB);
    const service = new TenantsService(db);
    const tenant = await service.findOne(id, userId);

    if (!tenant) return c.json({ error: "Tenant not found" }, 404);
    return c.json(tenant);
  }
);

// POST / - Add a tenant to a property
app.openapi(
  createRoute({
    ...routeConfig,
    method: "post",
    path: "/",
    summary: "Add a tenant to a property",
    request: {
      body: {
        content: {
          "application/json": {
            schema: tenantSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Created tenant",
        content: {
          "application/json": {
            schema: tenantResponseSchema,
          },
        },
      },
      400: { description: "Bad request" },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const userId = getUserId(c);
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);
    const service = new TenantsService(db);

    try {
      const tenant = await service.create(data, userId);
      return c.json(tenant, 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create tenant";
      return c.json({ error: message }, 400);
    }
  }
);

// PATCH /:id - Update tenant lease
app.openapi(
  createRoute({
    ...routeConfig,
    method: "patch",
    path: "/{id}",
    summary: "Update tenant lease dates",
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              leaseStart: z.coerce.date().optional(),
              leaseEnd: z.coerce.date().optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Updated tenant",
        content: {
          "application/json": {
            schema: tenantResponseSchema,
          },
        },
      },
      404: { description: "Tenant not found" },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const userId = getUserId(c);
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const db = createDb(c.env.DB);
    const service = new TenantsService(db);
    const tenant = await service.update(id, userId, data);

    if (!tenant) return c.json({ error: "Tenant not found" }, 404);
    return c.json(tenant);
  }
);

// DELETE /:id - Remove tenant from property
app.openapi(
  createRoute({
    ...routeConfig,
    method: "delete",
    path: "/{id}",
    summary: "Remove a tenant from a property",
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
      404: { description: "Tenant not found" },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const userId = getUserId(c);
    const id = c.req.param("id");
    const db = createDb(c.env.DB);
    const service = new TenantsService(db);
    const success = await service.delete(id, userId);

    if (!success) return c.json({ error: "Tenant not found" }, 404);
    return c.json({ success: true });
  }
);

export default app;
