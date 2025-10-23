import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserAppointments } from "../../services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function AppointmentCalendar() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [userId, setUserId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");

  // โหลดข้อมูลผู้ใช้
  useEffect(() => {
    const userData =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));

    if (!userData || !userData.id) {
      navigate("/login", { replace: true });
      return;
    }

    setUserId(userData.id);
  }, [navigate]);

  // ดึงข้อมูลการจอง
  useEffect(() => {
    if (userId) fetchAppointments();
  }, [userId]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await getUserAppointments(userId);
      setAppointments(res.data);
      setFilteredAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลการจองได้",
        confirmButtonText: "ตกลง"
      });
    } finally {
      setLoading(false);
    }
  };

  // กรองการจองตามสถานะ
  useEffect(() => {
    if (statusFilter === "ทั้งหมด") {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter(appointment => appointment.status === statusFilter);
      setFilteredAppointments(filtered);
    }
  }, [statusFilter, appointments]);

  // สร้างปฏิทิน
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendar = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      calendar.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return calendar;
  };

  // ตรวจสอบว่าวันนี้มีการจองหรือไม่
  const getAppointmentsForDate = (date) => {
    return filteredAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  // เปลี่ยนเดือน
  const changeMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  // จัดรูปแบบวันที่
  const formatDate = (date) => {
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // จัดรูปแบบเวลา
  const formatTime = (time) => {
    return time || "-";
  };

  // ตรวจสอบว่าวันนี้เป็นวันปัจจุบันหรือไม่
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // ตรวจสอบว่าวันนี้เป็นเดือนปัจจุบันหรือไม่
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // ตรวจสอบว่าวันนี้เป็นวันในอดีตหรือไม่
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // สีสถานะ
  const getStatusColor = (status) => {
    switch (status) {
      case "รอการอนุมัติ":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "อนุมัติแล้ว":
        return "bg-green-100 text-green-800 border-green-200";
      case "ปฏิเสธ":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-600">กำลังโหลดข้อมูลผู้ใช้...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-600">กำลังโหลดข้อมูลการจอง...</p>
        </div>
      </div>
    );
  }

  const calendar = generateCalendar();
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ปฏิทินการจอง</h1>
          <p className="text-lg text-gray-600">ดูการจองรถรับ-ส่งของคุณในรูปแบบปฏิทิน</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Filter Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  กรองตามสถานะ
                </h3>
                <p className="text-sm text-gray-600">เลือกสถานะการจองที่ต้องการดู</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {["ทั้งหมด", "รอการอนุมัติ", "อนุมัติแล้ว", "ปฏิเสธ"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      statusFilter === status
                        ? status === "ทั้งหมด"
                          ? "bg-blue-600 text-white shadow-md"
                          : status === "รอการอนุมัติ"
                          ? "bg-yellow-600 text-white shadow-md"
                          : status === "อนุมัติแล้ว"
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-red-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center">
                      {status === "ทั้งหมด" && (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      )}
                      {status === "รอการอนุมัติ" && (
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      )}
                      {status === "อนุมัติแล้ว" && (
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {status === "ปฏิเสธ" && (
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      {status}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Filter Summary */}
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center text-sm text-blue-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  แสดงการจอง: <strong>{statusFilter}</strong> 
                  {statusFilter !== "ทั้งหมด" && (
                    <span> ({filteredAppointments.length} รายการ)</span>
                  )}
                  {statusFilter === "ทั้งหมด" && (
                    <span> ({appointments.length} รายการ)</span>
                  )}
                </span>
              </div>
              
            </div>
          </div>

          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid - แสดงปฏิทินเสมอ แต่กรองข้อมูลตาม statusFilter */}
          <div className="grid grid-cols-7 gap-1 mb-6">
            {/* Day Headers */}
            {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
              <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50 rounded-lg">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendar.map((date, index) => {
              const dayAppointments = getAppointmentsForDate(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDate = isToday(date);
              const isPast = isPastDate(date);
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isCurrentMonthDay ? "bg-white" : "bg-gray-50"
                  } ${isTodayDate ? "ring-2 ring-blue-500 bg-blue-50" : ""} ${
                    isPast ? "opacity-60" : ""
                  }`}
                  onClick={() => {
                    if (dayAppointments.length > 0) {
                      setSelectedDate(date);
                    }
                  }}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentMonthDay ? "text-gray-900" : "text-gray-400"
                  } ${isTodayDate ? "text-blue-600 font-bold" : ""}`}>
                    {date.getDate()}
                  </div>
                  
                  {/* Appointment Indicators - แสดงเฉพาะการจองที่กรองแล้ว */}
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((appointment, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-1 rounded border ${getStatusColor(appointment.status)}`}
                      >
                        <div className="font-medium truncate">{appointment.hospital}</div>
                        <div className="text-xs opacity-75">{formatTime(appointment.appointment_time)}</div>
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayAppointments.length - 2} อื่นๆ
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Data Message - แสดงเมื่อไม่มีการจองตามการกรอง */}
          {filteredAppointments.length === 0 && statusFilter !== "ทั้งหมด" && (
            <div className="text-center py-8 bg-gray-50 rounded-xl mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-3">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">ไม่พบการจอง</h4>
              <p className="text-gray-500 mb-4">
                ไม่มีการจองที่มีสถานะ <span className="font-semibold text-gray-700">{statusFilter}</span> ในเดือนนี้
              </p>
              <button
                onClick={() => setStatusFilter("ทั้งหมด")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                ดูทั้งหมด
              </button>
            </div>
          )}

          {/* Legend - แสดงเฉพาะสถานะที่มีข้อมูล */}
          {filteredAppointments.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              {statusFilter === "ทั้งหมด" ? (
                <>
                  {appointments.some(apt => apt.status === "รอการอนุมัติ") && (
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">รอการอนุมัติ</span>
                    </div>
                  )}
                  {appointments.some(apt => apt.status === "อนุมัติแล้ว") && (
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">อนุมัติแล้ว</span>
                    </div>
                  )}
                  {appointments.some(apt => apt.status === "ปฏิเสธ") && (
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">ปฏิเสธ</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center">
                  <div className={`w-4 h-4 border rounded mr-2 ${
                    statusFilter === "รอการอนุมัติ" 
                      ? "bg-yellow-100 border-yellow-200"
                      : statusFilter === "อนุมัติแล้ว"
                      ? "bg-green-100 border-green-200"
                      : "bg-red-100 border-red-200"
                  }`}></div>
                  <span className="text-sm text-gray-600">{statusFilter}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/user/appointment")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                จองคิวใหม่
              </div>
            </button>
            <button
              onClick={() => navigate("/user/bookings")}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200 font-semibold"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                ดูรายการ
              </div>
            </button>
          </div>
        </div>

        {/* Selected Date Modal */}
        {selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">การจองวันที่ {formatDate(selectedDate)}</h3>
                      <p className="text-blue-100 text-sm">รายละเอียดการจองทั้งหมด</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {getAppointmentsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">ไม่มีการจอง</h4>
                    <p className="text-gray-500">วันที่ {formatDate(selectedDate)} ไม่มีการจอง</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getAppointmentsForDate(selectedDate).map((appointment) => (
                      <div key={appointment.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {appointment.first_name} {appointment.last_name}
                              </h4>
                              <p className="text-sm text-gray-600">{appointment.hospital}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(appointment.appointment_time)}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {appointment.phone}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                <button
                  onClick={() => setSelectedDate(null)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">ดูการจองของคุณในรูปแบบปฏิทินที่สวยงาม</p>
          <p className="text-xs mt-1">คลิกที่วันที่ที่มีการจองเพื่อดูรายละเอียด</p>
        </div>
      </div>
    </div>
  );
}
