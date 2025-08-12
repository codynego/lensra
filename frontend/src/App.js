import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext"; // Import AuthProvider
import ProtectedRoute from "./ProtectedRoute"; // Import ProtectedRoute
import RegisterForm from "./components/RegisterForm";
import RegistrationSuccess from "./components/RegistrationSuccess";
// import ForgotPassword from "./components/ForgotPassword";
import ResetPasswordConfirm from "./components/ResetPasswordConfirm";
import Login from "./components/Login";
import PhotographerDashboard from "./components/PhotographerDashboard";
import SharedView from "./components/SharedView";
import PublicBookingPage from "./components/PublicBookingPage";
import BookingConfirmation from "./components/Booking/BookingConfirmation";
import MyBookings from "./components/MyBookings";
import BookingManagement from "./components/Booking/BookingManagement";
import BlockedDates from "./components/Booking/BlockedDates";
import BookingSettings from "./components/Booking/BookingSettings";
import ClientManagement from "./components/Clients/ClientManagement";

const App = () => {
  return (
    <AuthProvider> {/* Wrap Router with AuthProvider */}
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicBookingPage />} />
          <Route path="/booking/confirm/:bookingId" element={<BookingConfirmation />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
          <Route path="/reset-password-confirm/:uidb64/:token" element={<ResetPasswordConfirm />} />
          <Route path="/share/gallery/:token" element={<SharedView />} />
          <Route path="/share/photo/:token" element={<SharedView />} />

          {/* Client Authenticated Routes */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings /> {/* Removed token prop */}
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PhotographerDashboard /> {/* Removed token prop */}
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute>
                <BookingManagement /> {/* Removed token prop */}
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blocked-dates"
            element={
              <ProtectedRoute>
                <BlockedDates /> {/* Removed token prop */}
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <BookingSettings /> {/* Removed token prop */}
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute>
                <ClientManagement /> {/* Removed token prop */}
              </ProtectedRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;