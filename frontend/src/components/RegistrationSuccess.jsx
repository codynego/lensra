import React from "react";

export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent p-6">
      <div className="max-w-md bg-white p-8 rounded shadow text-center">
        <h2 className="text-3xl font-bold mb-4 text-primary">Registration Successful!</h2>
        <p>Please check your email to activate your account.</p>
      </div>
    </div>
  );
}
