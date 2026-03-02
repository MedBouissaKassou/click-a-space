import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import ApartmentDetail from "./pages/ApartmentDetail";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import BlueprintsManager from "./pages/admin/BlueprintsManager";
import ApartmentsManager from "./pages/admin/ApartmentsManager";
import ZoneEditor from "./pages/admin/ZoneEditor";
import SiteSettings from "./pages/admin/SiteSettings";
import AdminsManager from "./pages/admin/AdminsManager";
import GalleryManager from "./pages/admin/GalleryManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/appartement/:id" element={<ApartmentDetail />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="blueprints" element={<BlueprintsManager />} />
                <Route path="apartments" element={<ApartmentsManager />} />
                <Route path="zone-editor" element={<ZoneEditor />} />
                <Route path="gallery" element={<GalleryManager />} />
                <Route path="settings" element={<SiteSettings />} />
                <Route path="admins" element={<AdminsManager />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
