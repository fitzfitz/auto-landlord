import {
  tenants,
  properties,
  users,
  TenantInput,
} from "@auto-landlord/shared";
import { createDb } from "../../db";
import { eq, and } from "drizzle-orm";

export class TenantsService {
  constructor(private db: ReturnType<typeof createDb>) {}

  /**
   * Get all tenants for properties owned by the landlord
   */
  async findAllForLandlord(landlordId: string) {
    // Get tenants with their property and user info
    const results = await this.db.query.tenants.findMany({
      with: {
        property: true,
        user: true,
      },
    });

    // Filter to only include tenants in properties owned by this landlord
    return results.filter(
      (tenant) => tenant.property?.landlordId === landlordId
    );
  }

  /**
   * Get tenants for a specific property (landlord must own property)
   */
  async findByProperty(propertyId: string, landlordId: string) {
    // First verify the property belongs to the landlord
    const property = await this.db.query.properties.findFirst({
      where: and(
        eq(properties.id, propertyId),
        eq(properties.landlordId, landlordId)
      ),
    });

    if (!property) return null;

    return this.db.query.tenants.findMany({
      where: eq(tenants.propertyId, propertyId),
      with: {
        user: true,
      },
    });
  }

  /**
   * Get a single tenant by ID (landlord must own the property)
   */
  async findOne(tenantId: string, landlordId: string) {
    const tenant = await this.db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
      with: {
        property: true,
        user: true,
      },
    });

    // Verify the landlord owns the property
    if (!tenant || tenant.property?.landlordId !== landlordId) {
      return null;
    }

    return tenant;
  }

  /**
   * Create a new tenant record
   * Note: This requires the user to already exist in the users table
   */
  async create(data: TenantInput, landlordId: string) {
    // Verify the property belongs to the landlord
    const property = await this.db.query.properties.findFirst({
      where: and(
        eq(properties.id, data.propertyId),
        eq(properties.landlordId, landlordId)
      ),
    });

    if (!property) {
      throw new Error("Property not found or access denied");
    }

    // Check if user exists by email
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (!user) {
      throw new Error("User not found. They must sign up first.");
    }

    // Check if user is already a tenant somewhere
    const existingTenant = await this.db.query.tenants.findFirst({
      where: eq(tenants.userId, user.id),
    });

    if (existingTenant) {
      throw new Error("User is already a tenant at another property");
    }

    // Create tenant record
    const [newTenant] = await this.db
      .insert(tenants)
      .values({
        userId: user.id,
        propertyId: data.propertyId,
        leaseStart: data.leaseStart,
        leaseEnd: data.leaseEnd,
      })
      .returning();

    // Update property status to OCCUPIED
    await this.db
      .update(properties)
      .set({ status: "OCCUPIED", updatedAt: new Date() })
      .where(eq(properties.id, data.propertyId));

    return {
      ...newTenant,
      user,
      property,
    };
  }

  /**
   * Update tenant lease dates
   */
  async update(
    tenantId: string,
    landlordId: string,
    data: { leaseStart?: Date; leaseEnd?: Date }
  ) {
    // Verify access
    const tenant = await this.findOne(tenantId, landlordId);
    if (!tenant) return null;

    const [updated] = await this.db
      .update(tenants)
      .set({
        ...(data.leaseStart && { leaseStart: data.leaseStart }),
        ...(data.leaseEnd && { leaseEnd: data.leaseEnd }),
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    return updated;
  }

  /**
   * Remove a tenant from a property
   */
  async delete(tenantId: string, landlordId: string) {
    const tenant = await this.findOne(tenantId, landlordId);
    if (!tenant) return null;

    // Delete tenant record
    await this.db.delete(tenants).where(eq(tenants.id, tenantId));

    // Update property status back to VACANT
    await this.db
      .update(properties)
      .set({ status: "VACANT", updatedAt: new Date() })
      .where(eq(properties.id, tenant.propertyId));

    return true;
  }
}
