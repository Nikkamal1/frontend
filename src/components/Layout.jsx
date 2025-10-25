import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ดึง user จาก localStorage เป็นหลัก (ระบบจะจำการเข้าสู่ระบบไว้โดยอัตโนมัติ)
    const storedUser = JSON.parse(localStorage.getItem("user"));

    // ตรวจสอบว่า user ยัง valid อยู่หรือไม่
    const isValidUser = (user) => {
      if (!user || !user.role || !user.id || !user.email) return false;
      
      // ตรวจสอบว่า user มี role ที่ถูกต้อง
      const validRoles = ['user', 'staff', 'admin'];
      if (!validRoles.includes(user.role)) return false;
      
      return true;
    };

    if (!isValidUser(storedUser)) {
      // ถ้าไม่มี user หรือ user ไม่ valid → redirect login
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      navigate("/login", { replace: true });
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  // ฟังก์ชันสำหรับอัปเดตข้อมูล user
  const updateUser = React.useCallback(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    // ตรวจสอบว่า user ยัง valid อยู่หรือไม่
    const isValidUser = (user) => {
      if (!user || !user.role || !user.id || !user.email) return false;
      
      // ตรวจสอบว่า user มี role ที่ถูกต้อง
      const validRoles = ['user', 'staff', 'admin'];
      if (!validRoles.includes(user.role)) return false;
      
      return true;
    };

    if (isValidUser(storedUser)) {
      setUser(storedUser);
    } else {
      // ถ้า user ไม่ valid → ลบข้อมูลและ redirect ไป login
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ฟังการเปลี่ยนแปลงใน localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      updateUser();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // ตรวจสอบการเปลี่ยนแปลงทุก 2 วินาที (สำหรับการอัปเดตใน tab เดียวกัน)
    const interval = setInterval(updateUser, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [navigate]);

  const handleLogout = () => {
    // ลบข้อมูล user จาก localStorage (ระบบจะจำการเข้าสู่ระบบไว้โดยอัตโนมัติ)
    localStorage.removeItem("user");
    
    // รีเซ็ต state
    setUser(null);
    
    // redirect ไป login
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (!user) {
    // ระหว่างรอตรวจสอบ user → แสดง loading
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-600">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen pt-16 overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        role={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} onLogout={handleLogout} onToggleSidebar={toggleSidebar} />
        <main className="flex-1 pt-16 lg:pt-20 overflow-auto bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
