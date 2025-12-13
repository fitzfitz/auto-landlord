"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { PublicProperty } from "@/lib/api";

// Fix Leaflet icon issue in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ListingMapProps {
  listings: PublicProperty[];
}

export default function ListingMap({ listings }: ListingMapProps) {
  // Center map on first listing or a default location (e.g., San Francisco)
  const center: [number, number] = [37.7749, -122.4194]; 

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Mock markers for demo since we don't have real lat/lng in DB yet */}
        {listings.map((listing, i) => (
          <Marker 
            key={listing.id} 
            position={[
              center[0] + (Math.random() - 0.5) * 0.05, 
              center[1] + (Math.random() - 0.5) * 0.05
            ]}
            icon={icon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm mb-1">{listing.address}</h3>
                <p className="text-blue-600 font-bold">${listing.rentAmount.toLocaleString()}/mo</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

