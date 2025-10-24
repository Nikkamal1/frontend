import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  let user = null;

  try {
    // อ่านข้อมูลจาก localStorage / sessionStorage
    user =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));
  } catch (err) {
    user = null;
  }

  // 1️⃣ ไม่มี user → กลับหน้า login ทันที
  if (!user || !user.role) {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // 2️⃣ role ไม่ถูกต้อง → เด้งไป dashboard ของตัวเอง
  if (!allowedRoles.includes(user.role)) {
    const redirectPath = {
      user: "/user/dashboard",
      staff: "/staff/dashboard",
      admin: "/admin/dashboard",
    }[user.role] || "/login";

    return <Navigate to={redirectPath} replace />;
  }

  // 3️⃣ ผ่านหมด → render children
  return children;
}
