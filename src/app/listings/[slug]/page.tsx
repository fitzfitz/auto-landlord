import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Bed, Bath, DollarSign, Mail } from "lucide-react";

const prisma = new PrismaClient();

export default async function PropertyListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      landlord: { select: { name: true, email: true } },
    },
  });

  if (!property || !property.isListed) {
    notFound();
  }

  const featuredImage = property.images[0]?.url || "/placeholder.jpg";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96 bg-gray-200">
        {property.images.length > 0 ? (
          <Image
            src={featuredImage}
            alt={property.address}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image Available
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{property.address}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <MapPin size={20} />
                {property.city}, {property.state} {property.zip}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6 text-gray-700">
              {property.bedrooms && (
                <div className="flex items-center gap-2">
                  <Bed size={20} />
                  <span>{property.bedrooms} Beds</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-2">
                  <Bath size={20} />
                  <span>{property.bathrooms} Baths</span>
                </div>
              )}
              <div className="flex items-center gap-2 font-bold text-green-600">
                <DollarSign size={20} />
                <span>${property.rentAmount}/month</span>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">
                  About This Property
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            )}

            {/* Image Gallery */}
            {property.images.length > 1 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.images.slice(1).map((image) => (
                    <div
                      key={image.id}
                      className="relative h-48 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={image.url}
                        alt="Property photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact/Application Form */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg sticky top-6">
              <h2 className="text-2xl font-semibold mb-4">Interested?</h2>
              <p className="text-gray-600 mb-6">
                Fill out the form below and the landlord will get back to you.
              </p>

              <form
                action={`/api/applications`}
                method="POST"
                className="space-y-4"
              >
                <input type="hidden" name="propertyId" value={property.id} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full border rounded-md p-2"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full border rounded-md p-2"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full border rounded-md p-2"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    className="w-full border rounded-md p-2"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 font-medium flex items-center justify-center gap-2"
                >
                  <Mail size={20} />
                  Request Tour
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-4">
                By submitting, you agree to be contacted about this property.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await prisma.property.findUnique({
    where: { slug },
  });

  if (!property) {
    return { title: "Property Not Found" };
  }

  return {
    title: `${property.address} - $${property.rentAmount}/mo | AutoLandlord`,
    description:
      property.description ||
      `${property.bedrooms} bed, ${property.bathrooms} bath property for rent in ${property.city}, ${property.state}`,
  };
}
