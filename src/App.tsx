import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Learning from "./pages/Learning";
import Marketplace from "./pages/Marketplace";
import MyBusiness from "./pages/MyBusiness";
import Finance from "./pages/Finance";
import Loans from "./pages/Loans";
import SHGGroups from "./pages/SHGGroups";
import MyOrders from "./pages/MyOrders";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/my-business" element={<MyBusiness />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/shg-groups" element={<SHGGroups />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
