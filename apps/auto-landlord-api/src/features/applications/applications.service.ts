import {
  applications,
  properties,
  ApplicationInput,
} from "@auto-landlord/shared";
import { createDb } from "../../db";
import { eq, inArray } from "drizzle-orm";

export class ApplicationsService {
  constructor(private db: ReturnType<typeof createDb>) {}

  async create(data: ApplicationInput) {
    const [newApp] = await this.db
      .insert(applications)
      .values({ ...data, status: "NEW" })
      .returning();
    return newApp;
  }

  async findAllForLandlord(landlordId: string) {
    // First, get all properties owned by this landlord
    const landlordProperties = await this.db.query.properties.findMany({
      where: eq(properties.landlordId, landlordId),
      columns: { id: true },
    });

    // If landlord has no properties, return empty array
    if (landlordProperties.length === 0) {
      return [];
    }

    // Get all property IDs
    const propertyIds = landlordProperties.map((p) => p.id);

    // Find all applications for these properties with property details
    const applicationsWithProperties =
      await this.db.query.applications.findMany({
        where: inArray(applications.propertyId, propertyIds),
        with: {
          property: true,
        },
        orderBy: (applications, { desc }) => [desc(applications.createdAt)],
      });

    return applicationsWithProperties;
  }
}
