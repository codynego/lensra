import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PublicBookingPage from "../components/PublicBookingPage";
import BookingConfirmation from "../components/Booking/BookingConfirmation";
import SharedView from "../components/SharedView";
import PhotographerWebsite from "../components/website/PhotographerWebsite";
import SelectionView from "../components/SelectionView";
import ModernPhotographerWebsite from "../components/website/ModernPhotographerWebsite";

export default function PublicSiteRoutes({ subdomain }) {
  return (
    <Routes>
      {/* Public booking page */}
      {/* <Route path="/" element={<PublicBookingPage subdomain={subdomain} />} /> */}
      <Route path="/booking/confirm/:bookingId" element={<BookingConfirmation />} />
      <Route path="/share/gallery/:token" element={<SharedView />} />
      <Route path="/share/photo/:token" element={<SharedView />} />
      <Route path="/gallery/public-selection/:token" element={<SelectionView />} />

      {/* Photographer public website */}
      {subdomain ? (
        <Route
          path="/*"
          element={<ModernPhotographerWebsite subdomain={subdomain} />}
        />
      ) : (
        <Route
          path="/:slug"
          element={<ModernPhotographerWebsite />}
        />
      )}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
