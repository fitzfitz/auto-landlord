import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyBySlug } from "@/lib/api";
import { Navigation } from "@/components/Navigation";
import { PropertyGallery } from "@/components/PropertyGallery";
import { MapPin, BedDouble, Bath, Home, ArrowLeft, Check, Phone, Mail, Calendar } from "lucide-react";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back */}
          <div className="mb-8">
            <Link
              href="/listings"
              className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Listings
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Gallery & Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Image Gallery */}
              <PropertyGallery 
                images={property.images || []} 
                address={property.address} 
              />

              {/* Property Info */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{property.address}</h1>
                    <div className="flex items-center text-slate-500 font-medium">
                      <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                      {property.city}, {property.state} {property.zip}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      ${property.rentAmount.toLocaleString()}
                    </div>
                    <div className="text-slate-400 font-medium text-sm uppercase tracking-wide">Per Month</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-slate-100 mb-8">
                  <div className="text-center">
                    <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Bedrooms</div>
                    <div className="flex items-center justify-center gap-2 text-slate-900 font-bold text-xl">
                      <BedDouble className="w-5 h-5 text-blue-500" />
                      {property.bedrooms ?? "-"}
                    </div>
                  </div>
                  <div className="text-center border-l border-r border-slate-100">
                    <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Bathrooms</div>
                    <div className="flex items-center justify-center gap-2 text-slate-900 font-bold text-xl">
                      <Bath className="w-5 h-5 text-blue-500" />
                      {property.bathrooms ?? "-"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Type</div>
                    <div className="flex items-center justify-center gap-2 text-slate-900 font-bold text-xl">
                      <Home className="w-5 h-5 text-blue-500" />
                      {property.propertyType ?? "-"}
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">About this home</h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {property.description || "No description provided for this property."}
                  </p>
                </div>

                {/* Amenities Section */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="border-t border-slate-100 pt-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {property.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
                            <Check className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium capitalize">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Contact Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Interested?</h3>
                  <p className="text-slate-500 text-sm mb-6">
                    Contact the property manager to schedule a viewing or ask questions.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <Link
                      href={`/apply?propertyId=${property.id}&slug=${slug}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      Schedule Viewing
                    </Link>
                    <Link
                      href={`/apply?propertyId=${property.id}&slug=${slug}`}
                      className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-3.5 px-4 rounded-xl transition-all hover:border-slate-300 flex items-center justify-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      Send Message
                    </Link>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
                    <Check className="w-3 h-3" />
                    Verified Listing
                  </div>
                </div>

                {/* Agent / Office Info (Placeholder) */}
                <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="font-bold text-slate-500">AL</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">AutoLandlord Office</p>
                      <p className="text-xs text-slate-500">Premier Property Management</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      (555) 123-4567
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      123 Business Park, Suite 100
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
