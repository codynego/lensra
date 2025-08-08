import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterForm from "./components/RegisterForm";
import RegistrationSuccess from "./components/RegistrationSuccess";
import ForgotPassword from "./components/ForgetPassword";
import ResetPasswordConfirm from "./components/ResetPasswordConfirm";
import Login from "./components/Login";
import PhotographerDashboard from './components/PhotographerDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password-confirm/:uidb64/:token" element={<ResetPasswordConfirm />} />
        <Route path="/dashboard" element={<PhotographerDashboard />} />
        {/* add other routes here */}
      </Routes>
    </Router>
  );
}
