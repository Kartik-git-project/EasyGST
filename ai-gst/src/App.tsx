import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AIChatbot } from "@/components/AIChatbot";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import UploadInvoices from "./pages/UploadInvoices";
import Analytics from "./pages/Analytics";
import AIInsights from "./pages/AIInsights";
import Reports from "./pages/Reports";
import History from "./pages/History";
import DashboardSettings from "./pages/DashboardSettings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import Profile from "./pages/Profile";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/upload" element={<UploadInvoices />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/insights" element={<AIInsights />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/history" element={<History />} />
          <Route path="/dashboard/settings" element={<DashboardSettings />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIChatbot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
