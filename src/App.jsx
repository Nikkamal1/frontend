import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import UserDashboard from "./pages/dashboard/UserDashboard.jsx";
import StaffDashboard from "./pages/dashboard/StaffDashboard.jsx";
import AdminDashboard from "./pages/dashboard/AdminDashboard.jsx";
import UserManagement from "./pages/dashboard/UserManagement.jsx";
import AppointmentManagement from "./pages/dashboard/AppointmentManagement.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import AppointmentForm from "./pages/AppointmentForm/AppointmentForm.jsx";
import UserAppointments from "./pages/AppointmentForm/UserAppointments.jsx";
import AppointmentCalendar from "./pages/AppointmentForm/AppointmentCalendar.jsx";
import EditAppointment from "./pages/AppointmentForm/EditAppointment.jsx";
import StaffAppointmentForm from "./pages/AppointmentForm/StaffAppointmentForm.jsx";
import StaffAppointments from "./pages/AppointmentForm/StaffAppointments.jsx";
import StaffCalendar from "./pages/AppointmentForm/StaffCalendar.jsx";
import StaffEditAppointment from "./pages/AppointmentForm/StaffEditAppointment.jsx";
import ProfileEdit from "./pages/dashboard/ProfileEdit.jsx";
import LineCallback from "./pages/LineCallback.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsOfUse from "./pages/TermsOfUse.jsx";

export default function App() {
  // ตรวจสอบ user จาก localStorage เป็นหลัก (ระบบจะจำการเข้าสู่ระบบไว้โดยอัตโนมัติ)
  const user = JSON.parse(localStorage.getItem("user"));

  // ถ้า user ยังล็อกอินอยู่ ให้ไป dashboard ของ role ตัวเอง
  const getDashboardPath = () => {
    if (!user?.role) return "/login";
    return `/${user.role}/dashboard`;
  };

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* LINE Callback */}
      <Route path="/line-callback" element={<LineCallback />} />
      
      {/* Privacy Policy & Terms of Use */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />

      {/* User */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Layout>
              <UserDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/reserve"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Layout>
              <AppointmentForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/bookings"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Layout>
              <UserAppointments />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/calendar"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Layout>
              <AppointmentCalendar />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/bookings/edit/:id"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Layout>
              <EditAppointment />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/profile/:id"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Layout>
              <ProfileEdit />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Staff */}
      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <Layout>
              <StaffDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/reserve"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <Layout>
              <StaffAppointmentForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/bookings"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <Layout>
              <StaffAppointments />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/calendar"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <Layout>
              <StaffCalendar />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/bookings/edit/:id"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <Layout>
              <StaffEditAppointment />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/profile/:id"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <Layout>
              <ProfileEdit />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <AppointmentManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <ProfileEdit />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback: ถ้า path ไม่ตรง */}
      <Route path="*" element={<Navigate to={getDashboardPath()} replace />} />
    </Routes>
  );
}
