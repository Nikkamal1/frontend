import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ดึง user จาก localStorage หรือ sessionStorage
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));

    if (!storedUser || !storedUser.role) {
      // ถ้าไม่มี user → redirect login
      navigate("/login", { replace: true });
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  // ฟังก์ชันสำหรับอัปเดตข้อมูล user
  const updateUser = () => {
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  };

  // ฟังการเปลี่ยนแปลงใน localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      updateUser();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // ตรวจสอบการเปลี่ยนแปลงทุก 1 วินาที (สำหรับการอัปเดตใน tab เดียวกัน)
    const interval = setInterval(updateUser, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (!user) {
    // ระหว่างรอตรวจสอบ user → ไม่ render layout
    return null;
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
