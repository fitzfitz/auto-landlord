import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignIn,
  useAuth,
} from "@clerk/clerk-react";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { DashboardPage } from "./features/dashboard";
import { PropertiesPage } from "./features/properties";
import { TenantsPage } from "./features/tenants";
import { TicketsPage } from "./features/tickets";
import { AuthProvider } from "./providers/AuthProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { QueryErrorBoundary } from "./components/QueryErrorBoundary";

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-gradient">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

function AuthenticatedApp() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <QueryErrorBoundary>
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="properties" element={<PropertiesPage />} />
              <Route path="tenants" element={<TenantsPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </QueryErrorBoundary>
      </ErrorBoundary>
    </AuthProvider>
  );
}

function App() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <SignedIn>
        <AuthenticatedApp />
      </SignedIn>
      <SignedOut>
        <div className="flex min-h-screen items-center justify-center bg-dark-gradient">
          <SignIn routing="hash" />
        </div>
      </SignedOut>
    </BrowserRouter>
  );
}

export default App;
