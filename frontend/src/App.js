import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterForm from "./components/RegisterForm";
import RegistrationSuccess from "./components/RegistrationSuccess";
import ForgotPassword from "./components/ForgetPassword";
import ResetPasswordConfirm from "./components/ResetPasswordConfirm";
import Login from "./components/Login";
import PhotographerDashboard from './components/PhotographerDashboard';
import SharedView from './components/SharedView';

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
        {/* Shared content routes - these match the Django URLs */}
        <Route path="/share/gallery/:token" element={<SharedView />} />
        <Route path="/share/photo/:token" element={<SharedView />} />
        

      </Routes>
    </Router>
  );
}
