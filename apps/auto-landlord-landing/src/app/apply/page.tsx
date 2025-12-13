"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import {
  submitApplication,
  getPropertyBySlug,
  PublicProperty,
} from "@/lib/api";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Home,
  MapPin,
} from "lucide-react";

export default function ApplyPage() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const propertySlug = searchParams.get("slug");

  const [property, setProperty] = useState<PublicProperty | null>(null);
  const [isLoadingProperty, setIsLoadingProperty] = useState(!!propertySlug);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  // Fetch property details if slug is provided
  useEffect(() => {
    if (propertySlug) {
      setIsLoadingProperty(true);
      getPropertyBySlug(propertySlug)
        .then((data) => {
          setProperty(data);
        })
        .finally(() => {
          setIsLoadingProperty(false);
        });
    }
  }, [propertySlug]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^[\d\s\-+()]{7,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!propertyId && !property?.id) {
      newErrors.general =
        "No property selected. Please go back and select a property.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    const targetPropertyId = propertyId || property?.id;

    if (!targetPropertyId) {
      setSubmitStatus("error");
      setSubmitMessage("No property selected.");
      setIsSubmitting(false);
      return;
    }

    const result = await submitApplication({
      propertyId: targetPropertyId,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      message: formData.message.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitStatus("success");
      setSubmitMessage(
        "Your application has been submitted successfully! We'll be in touch soon."
      );
      setFormData({ name: "", email: "", phone: "", message: "" });
    } else {
      setSubmitStatus("error");
      setSubmitMessage(
        result.error || "Something went wrong. Please try again."
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <div className="mb-8">
            <Link
              href={propertySlug ? `/listings/${propertySlug}` : "/listings"}
              className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to {propertySlug ? "Property" : "Listings"}
            </Link>
          </div>

          {/* Property Context Card */}
          {isLoadingProperty ? (
            <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-200 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ) : property ? (
            <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">
                    Applying for
                  </p>
                  <h2 className="text-lg font-bold text-slate-900">
                    {property.address}
                  </h2>
                  <div className="flex items-center text-slate-500 text-sm mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.city}, {property.state} {property.zip}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xl font-bold text-blue-600">
                    ${property.rentAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">per month</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                Rental Application
              </h1>
              <p className="text-slate-500">
                Fill out the form below and we&apos;ll get back to you within
                24-48 hours.
              </p>
            </div>

            {/* Success State */}
            {submitStatus === "success" && (
              <div className="mb-8 p-6 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 mb-1">
                      Application Submitted!
                    </h3>
                    <p className="text-green-700 text-sm">{submitMessage}</p>
                    <Link
                      href="/listings"
                      className="inline-flex items-center mt-4 text-sm font-semibold text-green-700 hover:text-green-800"
                    >
                      Browse more properties
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {submitStatus === "error" && (
              <div className="mb-8 p-6 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900 mb-1">
                      Submission Failed
                    </h3>
                    <p className="text-red-700 text-sm">{submitMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* General Error (no property) */}
            {errors.general && (
              <div className="mb-8 p-6 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 mb-1">
                      Property Required
                    </h3>
                    <p className="text-amber-700 text-sm">{errors.general}</p>
                    <Link
                      href="/listings"
                      className="inline-flex items-center mt-4 text-sm font-semibold text-amber-700 hover:text-amber-800"
                    >
                      Browse properties
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            {submitStatus !== "success" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.name
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                      } bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors`}
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.email
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                      } bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors`}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Phone Number{" "}
                      <span className="text-slate-400 font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.phone
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                      } bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors`}
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Message{" "}
                    <span className="text-slate-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us a bit about yourself, your move-in timeline, or any questions you have about the property..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || (!propertyId && !property?.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Application
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400">
                  By submitting this application, you agree to our{" "}
                  <Link href="#" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
