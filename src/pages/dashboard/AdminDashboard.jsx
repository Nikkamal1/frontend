import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAppointments, getAllUsers, downloadPDFReport } from "../../services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    approvedAppointments: 0,
    rejectedAppointments: 0,
    totalUsers: 0,
    adminUsers: 0,
    staffUsers: 0,
    regularUsers: 0,
    todayAppointments: 0,
    thisWeekAppointments: 0,
    thisMonthAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState("month"); // week, month, year

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // ดึงข้อมูลการจองทั้งหมด
      const appointmentsRes = await getAllAppointments(1, 1000);
      const appointmentsData = appointmentsRes.data.appointments || [];
      
      // ดึงข้อมูลผู้ใช้ทั้งหมด
      const usersRes = await getAllUsers();
      const usersData = usersRes.data || [];

      // คำนวณสถิติการจอง
      const totalAppointments = appointmentsData.length;
      const pendingAppointments = appointmentsData.filter(apt => apt.status === "รอการอนุมัติ").length;
      const approvedAppointments = appointmentsData.filter(apt => apt.status === "อนุมัติแล้ว").length;
      const rejectedAppointments = appointmentsData.filter(apt => apt.status === "ปฏิเสธ" || apt.status === "ยกเลิกการจอง").length;

      // คำนวณสถิติตามช่วงเวลา
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      const todayAppointments = appointmentsData.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate.toDateString() === new Date().toDateString();
      }).length;

      const thisWeekAppointments = appointmentsData.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= startOfWeek;
      }).length;

      const thisMonthAppointments = appointmentsData.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= startOfMonth;
      }).length;

      // คำนวณสถิติผู้ใช้
      const totalUsers = usersData.length;
      const adminUsers = usersData.filter(u => u.role_id === 3).length;
      const staffUsers = usersData.filter(u => u.role_id === 2).length;
      const regularUsers = usersData.filter(u => u.role_id === 1).length;

      setStats({
        totalAppointments,
        pendingAppointments,
        approvedAppointments,
        rejectedAppointments,
        totalUsers,
        adminUsers,
        staffUsers,
        regularUsers,
        todayAppointments,
        thisWeekAppointments,
        thisMonthAppointments
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้",
        confirmButtonText: "ตกลง"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    const periodText = {
      week: "รายสัปดาห์",
      month: "รายเดือน", 
      year: "รายปี"
    };

    Swal.fire({
      title: `รายงาน${periodText[reportPeriod]}`,
      html: `
        <div class="text-left space-y-3">
          <div class="bg-blue-50 p-3 rounded-lg">
            <h4 class="font-semibold text-blue-800">สถิติการจอง</h4>
            <p>การจองทั้งหมด: ${stats.totalAppointments} รายการ</p>
            <p>รอการอนุมัติ: ${stats.pendingAppointments} รายการ</p>
            <p>อนุมัติแล้ว: ${stats.approvedAppointments} รายการ</p>
            <p>ปฏิเสธ/ยกเลิก: ${stats.rejectedAppointments} รายการ</p>
          </div>
          <div class="bg-green-50 p-3 rounded-lg">
            <h4 class="font-semibold text-green-800">สถิติผู้ใช้</h4>
            <p>ผู้ใช้ทั้งหมด: ${stats.totalUsers} คน</p>
            <p>ผู้ใช้ทั่วไป: ${stats.regularUsers} คน</p>
            <p>เจ้าหน้าที่: ${stats.staffUsers} คน</p>
            <p>แอดมิน: ${stats.adminUsers} คน</p>
          </div>
          <div class="bg-purple-50 p-3 rounded-lg">
            <h4 class="font-semibold text-purple-800">สถิติตามช่วงเวลา</h4>
            <p>วันนี้: ${stats.todayAppointments} รายการ</p>
            <p>สัปดาห์นี้: ${stats.thisWeekAppointments} รายการ</p>
            <p>เดือนนี้: ${stats.thisMonthAppointments} รายการ</p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "ดาวน์โหลด PDF",
      cancelButtonText: "ปิด",
      confirmButtonColor: "#3B82F6",
      cancelButtonColor: "#6B7280"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // แสดง loading
          Swal.fire({
            title: "กำลังสร้างรายงาน PDF",
            text: "กรุณารอสักครู่...",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          // ดาวน์โหลด PDF
          const response = await downloadPDFReport(reportPeriod);
          
          // สร้าง blob และดาวน์โหลด
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          const periodText = {
            week: "รายสัปดาห์",
            month: "รายเดือน", 
            year: "รายปี"
          };
          
          link.download = `รายงานระบบ_${periodText[reportPeriod]}_${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          // แสดงข้อความสำเร็จ
          Swal.fire({
            icon: "success",
            title: "ดาวน์โหลดสำเร็จ",
            text: "รายงาน PDF ถูกดาวน์โหลดเรียบร้อยแล้ว",
            confirmButtonText: "ตกลง"
          });

        } catch (error) {
          console.error("PDF download error:", error);
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถดาวน์โหลดรายงาน PDF ได้",
            confirmButtonText: "ตกลง"
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-purple-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">สวัสดี {user?.name || "Admin"} — ตรวจสอบระบบทั้งหมดและรายงานได้ที่นี่</p>
        </div>

        {/* Admin Control Panel */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">แผงควบคุมแอดมิน</h2>
              <p className="text-sm text-gray-600">จัดการระบบและสร้างรายงาน</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Report Period Selector */}
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
              >
                <option value="week">รายสัปดาห์</option>
                <option value="month">รายเดือน</option>
                <option value="year">รายปี</option>
              </select>
              
              {/* Generate Report Button */}
              <button
                onClick={generateReport}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  สร้างรายงาน
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg w-full max-w-md">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => navigate('/admin/users')}
                className="px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:shadow-md"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span className="text-sm sm:text-base">จัดการผู้ใช้</span>
                </div>
              </button>
              <button
                onClick={() => navigate('/admin/appointments')}
                className="px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:shadow-md"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span className="text-sm sm:text-base">จัดการการจอง</span>
                </div>
              </button>
            </div>
          </div>
        </div> */}

        {/* Time-based Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-xl p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm sm:text-base">วันนี้</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.todayAppointments}</p>
                <p className="text-indigo-200 text-xs">การจอง</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-400 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm sm:text-base">สัปดาห์นี้</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.thisWeekAppointments}</p>
                <p className="text-emerald-200 text-xs">การจอง</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-400 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-xl p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm sm:text-base">เดือนนี้</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.thisMonthAppointments}</p>
                <p className="text-rose-200 text-xs">การจอง</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-400 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">ภาพรวมระบบ</h2>
              
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Total Appointments */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm sm:text-base">การจองทั้งหมด</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.totalAppointments}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-400 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pending Appointments */}
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm sm:text-base">รอการอนุมัติ</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.pendingAppointments}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Approved Appointments */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm sm:text-base">อนุมัติแล้ว</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.approvedAppointments}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-400 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Rejected Appointments */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm sm:text-base">ปฏิเสธ/ยกเลิก</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.rejectedAppointments}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-400 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* User Role Distribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-blue-50 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">ผู้ใช้ทั่วไป</h3>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.regularUsers}</p>
              <p className="text-sm text-blue-600">คน</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">เจ้าหน้าที่</h3>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.staffUsers}</p>
              <p className="text-sm text-green-600">คน</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
              <h3 className="text-base sm:text-lg font-semibold text-purple-800 mb-2">แอดมิน</h3>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.adminUsers}</p>
              <p className="text-sm text-purple-600">คน</p>
            </div>
          </div>

          {/* System Health & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* System Health */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 sm:p-6 border border-slate-200">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                สถานะระบบ
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-700">เซิร์ฟเวอร์</span>
                  <span className="flex items-center text-green-600 text-sm font-semibold">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    ออนไลน์
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-700">ฐานข้อมูล</span>
                  <span className="flex items-center text-green-600 text-sm font-semibold">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    เชื่อมต่อได้
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-700">API</span>
                  <span className="flex items-center text-green-600 text-sm font-semibold">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    ปกติ
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-700">อีเมล</span>
                  <span className="flex items-center text-green-600 text-sm font-semibold">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    ใช้งานได้
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 sm:p-6 border border-amber-200">
              <h3 className="text-lg sm:text-xl font-bold text-amber-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                กิจกรรมล่าสุด
              </h3>
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">ผู้ใช้ใหม่ลงทะเบียน</p>
                    <p className="text-xs text-gray-500">มีผู้ใช้ใหม่ {stats.regularUsers} คนในระบบ</p>
                    <p className="text-xs text-gray-400 mt-1">เมื่อสักครู่</p>
                  </div>
                </div>

                <div className="flex items-start p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">การจองใหม่</p>
                    <p className="text-xs text-gray-500">มี {stats.pendingAppointments} การจองรอการอนุมัติ</p>
                    <p className="text-xs text-gray-400 mt-1">5 นาทีที่แล้ว</p>
                  </div>
                </div>

                <div className="flex items-start p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">การอนุมัติสำเร็จ</p>
                    <p className="text-xs text-gray-500">อนุมัติการจอง {stats.approvedAppointments} รายการ</p>
                    <p className="text-xs text-gray-400 mt-1">10 นาทีที่แล้ว</p>
                  </div>
                </div>

                <div className="flex items-start p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">การจองที่ยกเลิก</p>
                    <p className="text-xs text-gray-500">มี {stats.rejectedAppointments} การจองที่ยกเลิก</p>
                    <p className="text-xs text-gray-400 mt-1">15 นาทีที่แล้ว</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-gray-600 mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm">ระบบจองรถรับ-ส่งโรงพยาบาล | สำหรับผู้ดูแลระบบ</p>
        </div>
      </div>
    </div>
  );
}
