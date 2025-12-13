import { getPublicProperties } from "@/lib/api";
import { Navigation } from "@/components/Navigation";
import { ListingsLayout } from "@/components/listings/ListingsLayout";

export default async function ListingsPage() {
  // Fetch real properties from API
  const listings = await getPublicProperties();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navigation />
      <ListingsLayout initialListings={listings} />
    </div>
  );
}
