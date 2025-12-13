import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./index.css";

// Validate required environment variables
const requiredEnvVars = {
  VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  VITE_API_URL: import.meta.env.VITE_API_URL,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  const errorMessage = `
    ❌ Missing required environment variables:
    ${missingVars.map((v) => `  - ${v}`).join("\n")}
    
    Please create apps/auto-landlord-admin/.env with:
    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
    VITE_API_URL=http://localhost:8787/api
  `;
  console.error(errorMessage);
  throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
}

const CLERK_PUBLISHABLE_KEY = requiredEnvVars.VITE_CLERK_PUBLISHABLE_KEY!;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
);
