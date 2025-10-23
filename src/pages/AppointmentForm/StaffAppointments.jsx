import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAppointments } from "../../services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function StaffAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // โหลดข้อมูลการจอง
  const fetchAppointments = async (page = 1, status = statusFilter, search = searchTerm) => {
    try {
      setLoading(true);
      const response = await getAllAppointments(page, 10, status, search);
      const data = response.data;
      
      setAppointments(data.appointments || []);
      setTotalPages(data.totalPages || 1);
      setTotalAppointments(data.total || 0);
      setCurrentPage(page);
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

  // กรองตามสถานะ
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchAppointments(1, status, searchTerm);
  };

  // ค้นหาตามชื่อ
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAppointments(1, statusFilter, searchTerm);
  };

  // เปลี่ยนหน้า
  const handlePageChange = (page) => {
    fetchAppointments(page, statusFilter, searchTerm);
  };

  // รีเซ็ตการกรอง
  const resetFilters = () => {
    setStatusFilter("");
    setSearchTerm("");
    setCurrentPage(1);
    fetchAppointments(1, "", "");
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

  // แสดงสถานะ
  const getStatusBadge = (status) => {
    const statusConfig = {
      'รอการอนุมัติ': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      'อนุมัติแล้ว': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'ปฏิเสธ': { color: 'bg-red-100 text-red-800', icon: '❌' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: '❓' };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${config.color}`}>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">รายการจองทั้งหมด</h1>
          <p className="text-lg text-gray-600">สำหรับเจ้าหน้าที่โรงพยาบาล</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Search and Filter Section */}
          <div className="mb-8">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ค้นหาตามชื่อผู้ใช้..."
                      className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 pl-12"
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    ค้นหา
                  </div>
                </button>
              </div>
            </form>

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => handleStatusFilter("")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  statusFilter === ""
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  ทั้งหมด ({totalAppointments})
                </div>
              </button>
              <button
                onClick={() => handleStatusFilter("รอการอนุมัติ")}
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
                onClick={() => handleStatusFilter("อนุมัติแล้ว")}
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
                onClick={() => handleStatusFilter("ปฏิเสธ")}
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
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  รีเซ็ต
                </div>
              </button>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">
                <strong>แสดงการจอง:</strong> {statusFilter || "ทั้งหมด"} ({appointments.length} รายการ) | 
                <strong> ทั้งหมด:</strong> {totalAppointments} | 
                <strong> กรองแล้ว:</strong> {appointments.length} | 
                <strong> สถานะที่มี:</strong> {statusFilter || "ทั้งหมด"}
              </p>
            </div>
          </div>

          {/* Appointments Table */}
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">ไม่พบข้อมูลการจอง</h3>
              <p className="text-gray-500">ลองเปลี่ยนเงื่อนไขการค้นหาหรือกรองข้อมูล</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-green-50 border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          ผู้ใช้
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          เบอร์โทร
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          โรงพยาบาล
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          วันที่
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          เวลา
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          สถานะ
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          การดำเนินการ
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-sm">
                                {appointment.first_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {appointment.first_name} {appointment.last_name}
                              </div>
                              <div className="text-xs text-gray-500">ID: {appointment.user_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{appointment.phone}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{appointment.hospital}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatDate(appointment.appointment_date)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{appointment.appointment_time}</td>
                        <td className="px-6 py-4">{getStatusBadge(appointment.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedAppointment(appointment)}
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                              ดูรายละเอียด
                            </button>
                            <button
                              onClick={() => handleEdit(appointment)}
                              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                              แก้ไข
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">
                            {appointment.first_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {appointment.first_name} {appointment.last_name}
                          </div>
                          <div className="text-sm text-gray-500">ID: {appointment.user_id}</div>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {appointment.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {appointment.hospital}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(appointment.appointment_date)} • {appointment.appointment_time}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="flex-1 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        ดูรายละเอียด
                      </button>
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="flex-1 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        แก้ไข
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
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
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="w-full py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors duration-200"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
