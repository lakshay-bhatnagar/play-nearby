import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import DiscoverPage from "./pages/DiscoverPage";
import ActivityPage from "./pages/ActivityPage";
import CreateGamePage from "./pages/CreateGamePage";
import ProfilePage from "./pages/ProfilePage";
import EquipsPage from "./pages/EquipsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import SettingsPage from "./pages/SettingsPage";
import EditPreferencesPage from "./pages/EditPreferencesPage";
import ActivityHistoryPage from "./pages/ActivityHistoryPage";
import EquipHistoryPage from "./pages/EquipHistoryPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="min-h-dvh bg-background flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-neon-blue border-t-transparent animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user && profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="min-h-dvh bg-background flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-neon-blue border-t-transparent animate-spin" /></div>;
  if (user && profile?.onboarding_completed) return <Navigate to="/" replace />;
  if (user && profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <>
    <Routes>
      <Route path="/" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><CreateGamePage /></ProtectedRoute>} />
      <Route path="/equips" element={<ProtectedRoute><EquipsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/edit-preferences" element={<ProtectedRoute><EditPreferencesPage /></ProtectedRoute>} />
      <Route path="/activity-history" element={<ProtectedRoute><ActivityHistoryPage /></ProtectedRoute>} />
      <Route path="/equip-history" element={<ProtectedRoute><EquipHistoryPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <BottomNav />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
