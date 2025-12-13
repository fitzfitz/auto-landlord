import { properties, propertyImages, PropertyInput } from "@auto-landlord/shared";
import { createDb } from "../../db";
import { eq, asc, inArray } from "drizzle-orm";

export class PropertiesService {
  constructor(private db: ReturnType<typeof createDb>) {}

  /**
   * Find all publicly listed properties (no auth required)
   */
  async findAllPublic() {
    // Get all properties where isListed = true
    const results = await this.db.query.properties.findMany({
      where: eq(properties.isListed, true),
    });

    if (results.length === 0) {
      return [];
    }

    // Get all images for these properties
    const propertyIds = results.map((p) => p.id);
    const allImages = await this.db
      .select()
      .from(propertyImages)
      .where(inArray(propertyImages.propertyId, propertyIds))
      .orderBy(asc(propertyImages.order));

    // Group images by property ID
    const imagesByProperty = new Map<string, typeof allImages>();
    for (const img of allImages) {
      const existing = imagesByProperty.get(img.propertyId) || [];
      existing.push(img);
      imagesByProperty.set(img.propertyId, existing);
    }

    // Combine properties with their images
    return results.map((p) => ({
      ...p,
      amenities: p.amenities ? JSON.parse(p.amenities) : [],
      images: imagesByProperty.get(p.id) || [],
    }));
  }

  /**
   * Find a single public property by slug (no auth required)
   */
  async findBySlug(slug: string) {
    const property = await this.db.query.properties.findFirst({
      where: (properties, { eq, and }) =>
        and(eq(properties.slug, slug), eq(properties.isListed, true)),
    });

    if (!property) return null;

    // Get images for this property
    const images = await this.db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, property.id))
      .orderBy(asc(propertyImages.order));

    return {
      ...property,
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      images,
    };
  }

  async findAll(userId: string) {
    // Get all properties for this user
    const results = await this.db.query.properties.findMany({
      where: eq(properties.landlordId, userId),
    });

    if (results.length === 0) {
      return [];
    }

    // Get all images for these properties in a single query
    const propertyIds = results.map((p) => p.id);
    const allImages = await this.db
      .select()
      .from(propertyImages)
      .where(inArray(propertyImages.propertyId, propertyIds))
      .orderBy(asc(propertyImages.order));

    // Group images by property ID
    const imagesByProperty = new Map<string, typeof allImages>();
    for (const img of allImages) {
      const existing = imagesByProperty.get(img.propertyId) || [];
      existing.push(img);
      imagesByProperty.set(img.propertyId, existing);
    }

    // Combine properties with their images
    return results.map((p) => ({
      ...p,
      amenities: p.amenities ? JSON.parse(p.amenities) : [],
      images: imagesByProperty.get(p.id) || [],
    }));
  }

  async findOne(id: string, userId: string) {
    const property = await this.db.query.properties.findFirst({
      where: (properties, { eq, and }) =>
        and(eq(properties.id, id), eq(properties.landlordId, userId)),
    });
    if (!property) return null;

    // Get images for this property
    const images = await this.db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, id))
      .orderBy(asc(propertyImages.order));

    return {
      ...property,
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      images,
    };
  }

  async create(data: PropertyInput, userId: string) {
    // Generate slug from address
    const baseSlug = this.generateSlug(data.address, data.city, data.state);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const [newProperty] = await this.db
      .insert(properties)
      .values({
        ...data,
        amenities: data.amenities ? JSON.stringify(data.amenities) : undefined,
        landlordId: userId,
        slug,
      })
      .returning();
    return newProperty;
  }

  private generateSlug(address: string, city: string, state: string): string {
    const text = `${address}-${city}-${state}`;
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, "")     // Remove leading/trailing hyphens
      .substring(0, 100);          // Limit length
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.db.query.properties.findFirst({
        where: eq(properties.slug, slug),
      });

      if (!existing) {
        return slug;
      }

      // Append counter to make unique
      slug = `${baseSlug}-${counter}`;
      counter++;

      // Safety limit
      if (counter > 100) {
        slug = `${baseSlug}-${Date.now()}`;
        return slug;
      }
    }
  }

  async update(id: string, userId: string, data: Partial<PropertyInput>) {
    // Ensure ownership
    const existing = await this.findOne(id, userId);
    if (!existing) return null;

    const [updated] = await this.db
      .update(properties)
      .set({
        ...data,
        amenities: data.amenities ? JSON.stringify(data.amenities) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();
    return updated;
  }

  async delete(id: string, userId: string) {
    const existing = await this.findOne(id, userId);
    if (!existing) return null;

    await this.db.delete(properties).where(eq(properties.id, id));
    return true;
  }

  async addImages(
    propertyId: string,
    userId: string,
    images: { url: string; key?: string; size?: number }[]
  ) {
    // Verify ownership
    const property = await this.findOne(propertyId, userId);
    if (!property) return null;

    // Get current max order for this property
    const existingImages = await this.db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId))
      .orderBy(asc(propertyImages.order));

    const startOrder = existingImages.length;

    // Insert new images
    const newImages = await Promise.all(
      images.map(async (img, index) => {
        const [inserted] = await this.db
          .insert(propertyImages)
          .values({
            propertyId,
            url: img.url,
            publicId: img.key,
            size: img.size,
            order: startOrder + index,
            createdAt: new Date(),
          })
          .returning();
        return inserted;
      })
    );

    return newImages;
  }

  async deleteImage(propertyId: string, imageId: string, userId: string) {
    // Verify ownership
    const property = await this.findOne(propertyId, userId);
    if (!property) return null;

    await this.db
      .delete(propertyImages)
      .where(eq(propertyImages.id, imageId));

    return true;
  }
}
