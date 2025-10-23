import React from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiCalendar, FiList, FiTruck, FiUsers, FiSettings } from "react-icons/fi";

export default function Sidebar({ role, isOpen, onClose }) {
  const links = {
    user: [
      { name: "แดชบอร์ด", to: "/user/dashboard", icon: <FiHome className="w-5 h-5 text-black" /> },
      { name: "จองคิวรถรับ-ส่ง", to: "/user/reserve", icon: <FiTruck className="w-5 h-5 text-black" /> },
      { name: "รายการจอง", to: "/user/bookings", icon: <FiList className="w-5 h-5 text-black" /> },
      { name: "ปฎิทินการจอง", to: "/user/calendar", icon: <FiCalendar className="w-5 h-5 text-black" /> },
    ],
    staff: [
      { name: "แดชบอร์ด", to: "/staff/dashboard", icon: <FiHome className="w-5 h-5 text-black" /> },
      { name: "จองคิวรถรับ-ส่ง", to: "/staff/reserve", icon: <FiTruck className="w-5 h-5 text-black" /> },
      { name: "รายการจอง", to: "/staff/bookings", icon: <FiList className="w-5 h-5 text-black" /> },
      { name: "ปฎิทินการจอง", to: "/staff/calendar", icon: <FiCalendar className="w-5 h-5 text-black" /> },
    ],
    admin: [
      { name: "แดชบอร์ด", to: "/admin/dashboard", icon: <FiHome className="w-5 h-5 text-black" /> },
      { name: "จัดการผู้ใช้งาน", to: "/admin/users", icon: <FiUsers className="w-5 h-5 text-black" /> },
      { name: "จัดการรายการจอง", to: "/admin/appointments", icon: <FiSettings className="w-5 h-5 text-black" /> },
    ],
  };

  const menuLinks = links[role] || links.user; // fallback to user

  return (
    <>
      {/* Overlay สำหรับมือถือ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-20 left-0 h-[calc(100vh-5rem)] w-72 bg-white/80 backdrop-blur-md shadow-xl transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:shadow-lg lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-64
          z-50 border-r border-white/20
        `}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm shadow-lg">
          <h2 className="text-white font-bold text-lg drop-shadow-lg">เมนูหลัก</h2>
          <p className="text-blue-100 text-sm drop-shadow-md">
            {role === 'admin' ? 'ผู้ดูแลระบบ' : role === 'staff' ? 'เจ้าหน้าที่' : 'ผู้ใช้งาน'}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4 space-y-2">
          {menuLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-500/80 to-purple-500/80 backdrop-blur-sm text-white shadow-lg transform scale-105 border border-white/20" 
                    : "text-gray-700 hover:bg-white/50 hover:text-blue-600 hover:shadow-md hover:backdrop-blur-sm border border-transparent hover:border-white/20"
                }`
              }
              onClick={onClose} // ปิด sidebar เมื่อคลิกบนมือถือ
            >
              <span className={`transition-colors duration-200 ${
                menuLinks.find(l => l.to === link.to)?.to === link.to ? 'text-white drop-shadow-sm' : 'text-black group-hover:text-blue-600'
              }`}>
                {link.icon}
              </span>
              <span className="text-sm lg:text-base">{link.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 bg-gray-50  shadow-inner">
          <div className="text-xs text-gray-700 text-center font-medium drop-shadow-sm">
            ระบบจองรถรับ-ส่งโรงพยาบาล
          </div>
        </div>
      </aside>
    </>
  );
}
