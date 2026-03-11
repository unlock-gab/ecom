import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import ProductLanding from "@/pages/ProductLanding";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminDelivery from "@/pages/admin/AdminDelivery";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/delivery" component={AdminDelivery} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/landing/:id" component={ProductLanding} />
      <Route path="/">
        <StoreLayout>
          <Home />
        </StoreLayout>
      </Route>
      <Route path="/products">
        <StoreLayout>
          <Products />
        </StoreLayout>
      </Route>
      <Route path="/products/:id">
        <StoreLayout>
          <ProductDetail />
        </StoreLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
