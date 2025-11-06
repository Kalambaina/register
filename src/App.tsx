import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IndexSimplified from "./pages/IndexSimplified";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import IndividualDashboardPage from "./pages/IndividualDashboard";
import AdminDashboard from "./pages/Admin";
import Registration from "./pages/Registration";
import Tracking from "./pages/Tracking";
import TicketValidation from "./pages/TicketValidation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexSimplified />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/track" element={<Tracking />} />
          <Route path="/dashboard/:trackingNumber" element={<Dashboard />} />
          <Route path="/individual-dashboard/:trackingNumber" element={<IndividualDashboardPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/ticket/:ticketNumber" element={<TicketValidation />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
