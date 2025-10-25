import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  let user = null;

  try {
    // อ่านข้อมูลจาก localStorage เป็นหลัก (ระบบจะจำการเข้าสู่ระบบไว้โดยอัตโนมัติ)
    user = JSON.parse(localStorage.getItem("user"));
  } catch (err) {
    user = null;
  }

  // ตรวจสอบว่า user ยัง valid อยู่หรือไม่
  const isValidUser = (user) => {
    if (!user || !user.role || !user.id || !user.email) return false;
    
    // ตรวจสอบว่า user มี role ที่ถูกต้อง
    const validRoles = ['user', 'staff', 'admin'];
    if (!validRoles.includes(user.role)) return false;
    
    return true;
  };

  // 1️⃣ ไม่มี user หรือ user ไม่ valid → กลับหน้า login ทันที
  if (!isValidUser(user)) {
    localStorage.removeItem("user");
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
