import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserAppointments } from "../../services/api";
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiMapPin } from "react-icons/fi";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import LineConnection from "../../components/LineConnection.jsx";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      fetchAppointments(userData.id);
    }
  }, []);

  const fetchAppointments = async (userId) => {
    try {
      setLoading(true);
      const res = await getUserAppointments(userId);
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลได้",
        confirmButtonText: "ตกลง"
      });
    } finally {
      setLoading(false);
    }
  };

  // คำนวณสถิติ
  const stats = {
    total: appointments.length,
    pending: appointments.filter(apt => apt.status === "รอการอนุมัติ").length,
    approved: appointments.filter(apt => apt.status === "อนุมัติแล้ว").length,
    rejected: appointments.filter(apt => apt.status === "ยกเลิกการจอง").length,
  };

  // การจองล่าสุด (สูงสุด 5 รายการ)
  const recentAppointments = appointments
    .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
    .slice(0, 5);

  // การจองวันนี้
  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toDateString();
    const aptDate = new Date(apt.appointment_date).toDateString();
    return aptDate === today;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                สวัสดี, {user?.name || "ผู้ใช้งาน"}
              </h1>
              <p className="text-lg text-gray-600">ยินดีต้อนรับสู่ระบบจองรถรับ-ส่งโรงพยาบาล</p>
            </div>
            <div className="hidden md:flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FiTruck className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Appointments */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">การจองทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Appointments */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">รอการอนุมัติ</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Approved Appointments */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">อนุมัติแล้ว</p>
                <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Rejected Appointments */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ยกเลิกการจอง</p>
                <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FiXCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        {todayAppointments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FiCalendar className="w-6 h-6 text-blue-600 mr-3" />
                การจองวันนี้
              </h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {todayAppointments.length} รายการ
              </span>
            </div>
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <FiMapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{appointment.hospital}</p>
                      <p className="text-sm text-gray-600">{appointment.appointment_time}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    appointment.status === "อนุมัติแล้ว" ? "bg-green-100 text-green-800" :
                    appointment.status === "รอการอนุมัติ" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Appointments List */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FiClock className="w-6 h-6 text-purple-600 mr-3" />
                การจองล่าสุด
              </h2>
              <button
                onClick={() => navigate("/user/bookings")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ดูทั้งหมด
              </button>
            </div>
            <div className="space-y-4">
              {recentAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <FiCalendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">ยังไม่มีการจอง</p>
                </div>
              ) : (
                recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <FiTruck className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{appointment.hospital}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.appointment_date).toLocaleDateString('th-TH')} • {appointment.appointment_time}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appointment.status === "อนุมัติแล้ว" ? "bg-green-100 text-green-800" :
                      appointment.status === "รอการอนุมัติ" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* LINE Connection */}
          {user && (
            <div className="mb-6">
              <LineConnection userId={user.id} />
            </div>
          )}

          {/* System Status & Tips */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ข้อมูลและคำแนะนำ
            </h2>
            
            {/* System Status */}
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold text-green-800">ระบบทำงานปกติ</p>
                    <p className="text-sm text-green-600">บริการ 24 ชั่วโมง</p>
                  </div>
                </div>
                <div className="text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">จองล่วงหน้า</h4>
                    <p className="text-sm text-blue-600">แนะนำให้จองล่วงหน้า 1-2 วัน เพื่อความสะดวก</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">ระบุตำแหน่ง</h4>
                    <p className="text-sm text-yellow-600">กรุณาระบุตำแหน่งที่ชัดเจนเพื่อความแม่นยำ</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-1">ติดต่อสอบถาม</h4>
                    <p className="text-sm text-purple-600">โทร 02-xxx-xxxx หรือ Line: @hospital</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="mt-6">
              <button
                onClick={() => navigate("/user/reserve")}
                className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center">
                  <FiTruck className="w-6 h-6 mr-3" />
                  <span className="text-lg font-semibold">จองคิวรถรับ-ส่ง</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">ระบบจองรถรับ-ส่งโรงพยาบาล</p>
          <p className="text-xs mt-1">บริการ 24 ชั่วโมง</p>
        </div>
      </div>
    </div>
  );
}
