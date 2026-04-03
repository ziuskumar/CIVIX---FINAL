import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Petitions from "./pages/Petitions";
import CreatePetition from "./pages/CreatePetition";
import Polls from "./pages/Polls";
import CreatePoll from "./pages/CreatePoll";
import Reports from "./pages/Reports";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HelpSupport from "./pages/HelpSupport";
import Settings from "./pages/Settings";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* NEW ROUTES */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/petitions" element={
          <ProtectedRoute><Petitions /></ProtectedRoute>
        } />

        <Route path="/create-petition" element={
          <ProtectedRoute><CreatePetition /></ProtectedRoute>
        } />

        <Route path="/polls" element={
          <ProtectedRoute><Polls /></ProtectedRoute>
        } />

      <Route
  path="/help-support"
  element={
    <ProtectedRoute>
      <HelpSupport />
    </ProtectedRoute>
  }
/>

        <Route path="/reports" element={
          <ProtectedRoute><Reports /></ProtectedRoute>
        } />

        <Route
 path="/settings"
 element={
  <ProtectedRoute>
    <Settings/>
  </ProtectedRoute>
 }
/>
      </Routes>

    </>
  );
}

export default App;