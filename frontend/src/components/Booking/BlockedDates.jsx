import React from "react";

const BlockedDates = ({ token }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Blocked Dates</h1>
      <p>Feature to select unavailable dates to be implemented.</p>
      {/* Future implementation: Calendar to mark blocked dates, API calls to /api/blocked-dates/ */}
    </div>
  );
};

export default BlockedDates;