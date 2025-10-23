import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAppointments } from "../../services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function StaffCalendar() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // โหลดข้อมูลการจอง
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAllAppointments(1, 1000); // ดึงข้อมูลทั้งหมด
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
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

  useEffect(() => {
    fetchAppointments();
  }, []);

  // กรองข้อมูลตามสถานะ
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

  // แสดงสถานะ
  const getStatusBadge = (status) => {
    const statusConfig = {
      'รอการอนุมัติ': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      'อนุมัติแล้ว': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'ปฏิเสธ': { color: 'bg-red-100 text-red-800', icon: '❌' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: '❓' };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {status}
      </span>
    );
  };

  // แสดงวันที่
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // สร้าง URL สำหรับ Google Maps Embed
  const getMapEmbedUrl = (appointment) => {
    if (appointment.latitude && appointment.longitude) {
      return `https://www.google.com/maps?q=${appointment.latitude},${appointment.longitude}&z=15&output=embed`;
    } else {
      const q = encodeURIComponent(appointment.hospital || "โรงพยาบาลใกล้ฉัน");
      return `https://www.google.com/maps?q=${q}&z=15&output=embed`;
    }
  };

  // แก้ไขการจอง
  const handleEdit = (appointment) => {
    if (appointment.status !== "รอการอนุมัติ") {
      Swal.fire({
        icon: "warning",
        title: "ไม่สามารถแก้ไขได้",
        text: "สามารถแก้ไขได้เฉพาะการจองที่มีสถานะ 'รอการอนุมัติ' เท่านั้น",
        confirmButtonText: "ตกลง"
      });
      return;
    }
    navigate(`/staff/bookings/edit/${appointment.id}`);
  };

  const calendar = generateCalendar();
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ปฏิทินการจอง</h1>
          <p className="text-lg text-gray-600">สำหรับเจ้าหน้าที่โรงพยาบาล</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Filter Section */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => setStatusFilter("ทั้งหมด")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  statusFilter === "ทั้งหมด"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  ทั้งหมด ({appointments.length})
                </div>
              </button>
              <button
                onClick={() => setStatusFilter("รอการอนุมัติ")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  statusFilter === "รอการอนุมัติ"
                    ? "bg-yellow-600 text-white shadow-lg"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">⏳</span>
                  รอการอนุมัติ
                </div>
              </button>
              <button
                onClick={() => setStatusFilter("อนุมัติแล้ว")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  statusFilter === "อนุมัติแล้ว"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">✅</span>
                  อนุมัติแล้ว
                </div>
              </button>
              <button
                onClick={() => setStatusFilter("ปฏิเสธ")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  statusFilter === "ปฏิเสธ"
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">❌</span>
                  ปฏิเสธ
                </div>
              </button>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">
                <strong>แสดงการจอง:</strong> {statusFilter} ({filteredAppointments.length} รายการ) | 
                <strong> ทั้งหมด:</strong> {appointments.length} | 
                <strong> กรองแล้ว:</strong> {filteredAppointments.length} | 
                <strong> สถานะที่มี:</strong> {statusFilter}
              </p>
            </div>
          </div>

          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
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
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-100 rounded-lg">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendar.map((date, index) => {
              const dayAppointments = getAppointmentsForDate(date);
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-200 rounded-lg ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className={`text-sm font-semibold mb-2 ${
                    isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                  } ${isToday ? 'text-blue-600' : ''}`}>
                    {date.getDate()}
                  </div>
                  
                  {/* Appointment Indicators */}
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((appointment, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedAppointment(appointment)}
                        className="text-xs p-1 rounded cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        style={{
                          backgroundColor: appointment.status === 'รอการอนุมัติ' ? '#fef3c7' :
                                         appointment.status === 'อนุมัติแล้ว' ? '#d1fae5' :
                                         '#fee2e2',
                          color: appointment.status === 'รอการอนุมัติ' ? '#92400e' :
                                 appointment.status === 'อนุมัติแล้ว' ? '#065f46' :
                                 '#991b1b'
                        }}
                      >
                        <div className="font-semibold truncate">
                          {appointment.first_name} {appointment.last_name}
                        </div>
                        <div className="truncate">{appointment.appointment_time}</div>
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

          {/* Legend */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-200 rounded mr-2"></div>
              <span className="text-sm text-gray-600">รอการอนุมัติ</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
              <span className="text-sm text-gray-600">อนุมัติแล้ว</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-200 rounded mr-2"></div>
              <span className="text-sm text-gray-600">ปฏิเสธ</span>
            </div>
          </div>
        </div>

        {/* Modal ดูรายละเอียด */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">รายละเอียดการจอง</h2>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="text-white hover:text-gray-200 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Status Badge */}
                <div className="mb-6 text-center">
                  {getStatusBadge(selectedAppointment.status)}
                </div>

                {/* Information Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Personal Info */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      ข้อมูลส่วนตัว
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>ชื่อ-นามสกุล:</strong> {selectedAppointment.first_name} {selectedAppointment.last_name}</p>
                      <p><strong>เบอร์โทร:</strong> {selectedAppointment.phone}</p>
                      <p><strong>User ID:</strong> {selectedAppointment.user_id}</p>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      สถานที่
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>จังหวัด:</strong> {selectedAppointment.province}</p>
                      <p><strong>อำเภอ:</strong> {selectedAppointment.district}</p>
                      <p><strong>ตำบล:</strong> {selectedAppointment.subdistrict}</p>
                      <p><strong>โรงพยาบาล:</strong> {selectedAppointment.hospital}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment Info */}
                <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    ข้อมูลการจอง
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <p><strong>วันที่จอง:</strong> {formatDate(selectedAppointment.appointment_date)}</p>
                    <p><strong>เวลารับส่ง:</strong> {selectedAppointment.appointment_time}</p>
                    <p><strong>สถานะ:</strong> {selectedAppointment.status}</p>
                    <p><strong>วันที่สร้าง:</strong> {formatDate(selectedAppointment.created_at)}</p>
                  </div>
                </div>

                {/* Map Section */}
                {selectedAppointment.latitude && selectedAppointment.longitude && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      ตำแหน่ง
                    </h3>
                    
                    {/* Google Maps Embed */}
                    <div className="mb-4">
                      <iframe
                        src={getMapEmbedUrl(selectedAppointment)}
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        title="แผนที่ตำแหน่ง"
                        className="w-full rounded-lg shadow-lg"
                      ></iframe>
                    </div>

                    {/* Coordinate Info */}
                    <div className="text-sm text-gray-600 mb-4">
                      <p><strong>ละติจูด:</strong> {selectedAppointment.latitude}</p>
                      <p><strong>ลองจิจูด:</strong> {selectedAppointment.longitude}</p>
                    </div>

                    {/* Google Maps Link */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={`https://www.google.com/maps?q=${selectedAppointment.latitude},${selectedAppointment.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <div className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          เปิดใน Google Maps
                        </div>
                      </a>
                      
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedAppointment.latitude},${selectedAppointment.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-center font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <div className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          นำทางไปยังจุดหมาย
                        </div>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="flex-1 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors duration-200"
                  >
                    ปิด
                  </button>
                  {selectedAppointment && selectedAppointment.status === "รอการอนุมัติ" && (
                    <button
                      onClick={() => {
                        setSelectedAppointment(null);
                        handleEdit(selectedAppointment);
                      }}
                      className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors duration-200"
                    >
                      แก้ไข
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
