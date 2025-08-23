import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";
import RegisterForm from "../components/RegisterForm";
import RegistrationSuccess from "../components/RegistrationSuccess";
import ResetPasswordConfirm from "../components/ResetPasswordConfirm";
import Login from "../components/Login";
import PhotographerDashboard from "../components/PhotographerDashboard";
import MyBookings from "../components/MyBookings";
import BookingManagement from "../components/Booking/BookingManagement";
import BlockedDates from "../components/Booking/BlockedDates";
import BookingSettings from "../components/Booking/BookingSettings";
import ClientManagement from "../components/Clients/ClientManagement";
import PhotographerSetup from "../components/website/PhotographerSetup";
import UpgradeComponent from "../components/UpgradeComponent2";
import LensraLanding from "../components/LensraLanding";
import LensraWaitlist from "../components/LensraWaitlist";
import Page404 from "../components/404Page";

export default function MainPlatformRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LensraWaitlist />} />
      <Route path="/home" element={<LensraLanding />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registration-success" element={<RegistrationSuccess />} />
      <Route path="/reset-password-confirm/:uidb64/:token" element={<ResetPasswordConfirm />} />

      <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><PhotographerDashboard /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute><BookingManagement /></ProtectedRoute>} />
      <Route path="/admin/blocked-dates" element={<ProtectedRoute><BlockedDates /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><BookingSettings /></ProtectedRoute>} />
      <Route path="/admin/clients" element={<ProtectedRoute><ClientManagement /></ProtectedRoute>} />
      <Route path="/setup" element={<ProtectedRoute><PhotographerSetup /></ProtectedRoute>} />
      <Route path="/upgrade" element={<ProtectedRoute><UpgradeComponent /></ProtectedRoute>} />

      <Route path="/404page" element={<Page404 />} />
    </Routes>
  );
}
