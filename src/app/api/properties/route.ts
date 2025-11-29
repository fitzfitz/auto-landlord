import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      address,
      city,
      state,
      zip,
      rentAmount,
      bedrooms,
      bathrooms,
      propertyType,
      description,
    } = body;

    // Generate slug from address
    const slug = `${address}-${city}-${state}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const property = await prisma.property.create({
      data: {
        landlordId: user.id,
        address,
        city,
        state,
        zip,
        rentAmount: parseInt(rentAmount),
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseFloat(bathrooms) : null,
        propertyType,
        description,
        slug,
        status: "VACANT",
      },
    });

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Property creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create property",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Update property
export async function PUT(request: NextRequest) {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      address,
      city,
      state,
      zip,
      rentAmount,
      bedrooms,
      bathrooms,
      propertyType,
      description,
      deletedImageIds,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Property ID required" },
        { status: 400 }
      );
    }

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: { id, landlordId: user.id },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Update property details
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        address,
        city,
        state,
        zip,
        rentAmount: parseInt(rentAmount),
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseFloat(bathrooms) : null,
        propertyType,
        description,
      },
    });

    // Handle image deletion
    if (deletedImageIds && deletedImageIds.length > 0) {
      const imagesToDelete = await prisma.propertyImage.findMany({
        where: {
          id: { in: deletedImageIds },
          propertyId: id,
        },
      });

      // Delete from R2 (fire and forget to speed up response)
      // In production, you might want to use a queue
      const { deleteFromR2 } = await import("@/lib/r2-upload");
      imagesToDelete.forEach((img) => {
        if (img.publicId) {
          deleteFromR2(img.publicId).catch(console.error);
        }
      });

      // Delete from DB
      await prisma.propertyImage.deleteMany({
        where: {
          id: { in: deletedImageIds },
        },
      });
    }

    return NextResponse.json({ property: updatedProperty });
  } catch (error) {
    console.error("Property update error:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

// Toggle property listing status
export async function PATCH(request: NextRequest) {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId, isListed } = await request.json();

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID required" },
        { status: 400 }
      );
    }

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: { id: propertyId, landlordId: user.id },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Update listing status
    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: { isListed },
    });

    return NextResponse.json({ success: true, property: updated });
  } catch (error) {
    console.error("Toggle listing error:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

// Delete property
export async function DELETE(request: NextRequest) {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("id");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID required" },
        { status: 400 }
      );
    }

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: { id: propertyId, landlordId: user.id },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Delete property (cascade will delete related records)
    await prisma.property.delete({ where: { id: propertyId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete property error:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
