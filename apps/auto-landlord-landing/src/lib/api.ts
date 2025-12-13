/**
 * API client for the landing page (public-facing)
 * Fetches publicly available property listings
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/api";

export interface PublicProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  rentAmount: number;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: string | null;
  description: string | null;
  amenities?: string[];
  slug: string;
  images?: Array<{
    id: string;
    url: string;
    order: number;
  }>;
}

/**
 * Fetch all publicly listed properties
 */
export async function getPublicProperties(): Promise<PublicProperty[]> {
  try {
    const response = await fetch(`${API_URL}/properties/public`, {
      cache: "no-store", // Always fetch fresh data for now
      // In production, you might want: cache: 'force-cache' with revalidation
    });

    if (!response.ok) {
      console.error("Failed to fetch properties:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching public properties:", error);
    return [];
  }
}

/**
 * Fetch a single property by slug
 */
export async function getPropertyBySlug(
  slug: string
): Promise<PublicProperty | null> {
  try {
    const response = await fetch(`${API_URL}/properties/public/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch property: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching property by slug:", error);
    return null;
  }
}

/**
 * Helper to get full image URL
 */
export function getImageUrl(relativePath: string): string {
  if (!relativePath) return "";
  
  // If already a full URL, return as-is
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
    return relativePath;
  }
  
  // Otherwise prepend API URL
  const baseUrl = API_URL.endsWith("/") ? API_URL : `${API_URL}/`;
  const path = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath;
  return `${baseUrl}${path}`;
}

/**
 * Application submission types
 */
export interface ApplicationInput {
  propertyId: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

export interface ApplicationResponse {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Submit a rental application for a property
 */
export async function submitApplication(
  data: ApplicationInput
): Promise<{ success: boolean; data?: ApplicationResponse; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.error || `Request failed: ${response.statusText}`,
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error submitting application:", error);
    return {
      success: false,
      error: "Failed to submit application. Please try again later.",
    };
  }
}

