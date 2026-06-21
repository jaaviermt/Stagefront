import { FC } from "react";
import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext.js";
import AdminGuard from "./components/AdminGuard.js";
import Navbar from "./components/Navbar.js";
import HomePage from "./pages/HomePage.js";
import EventsPage from "./pages/EventsPage.js";
import EventDetailPage from "./pages/EventDetailPage.js";
import ResalesPage from "./pages/ResalesPage.js";
import CheckoutPage from "./pages/CheckoutPage.js";
import OrdersPage from "./pages/OrdersPage.js";
import AdminLoginPage from "./pages/AdminLoginPage.js";
import AdminDashboardPage from "./pages/AdminDashboardPage.js";

const App: FC = () => {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminDashboardPage />
            </AdminGuard>
          }
        />
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/resales" element={<ResalesPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </AdminAuthProvider>
  );
};

export default App;
