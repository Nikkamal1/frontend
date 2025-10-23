import React, { useState, useEffect } from "react";
import { getAllAppointments, getAllUsers, updateAppointmentStatusAdmin } from "../../services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentFilter, setAppointmentFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // ดึงข้อมูลการจองทั้งหมด
      const appointmentsRes = await getAllAppointments(1, 1000);
      const appointmentsData = appointmentsRes.data.appointments || [];
      
      // ดึงข้อมูลผู้ใช้ทั้งหมด
      const usersRes = await getAllUsers();
      const usersData = usersRes.data || [];

      setAppointments(appointmentsData);
      setUsers(usersData);

    } catch (error) {
      console.error("Error fetching data:", error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'รอการอนุมัติ': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      'อนุมัติแล้ว': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'ยกเลิกการจอง': { color: 'bg-red-100 text-red-800', icon: '❌' },
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

  const filteredAppointments = appointments.filter(appointment => {
    if (appointmentFilter === "all") return true;
    return appointment.status === appointmentFilter;
  });

  // ฟังก์ชันแก้ไขการจองสำหรับแอดมิน
  const handleEditAppointment = async (appointmentId) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    const { value: formValues } = await Swal.fire({
      title: 'แก้ไขสถานะการจอง',
      html: `
        <div class="text-left space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-800 mb-2">ข้อมูลการจอง</h4>
            <p class="text-sm text-gray-600"><strong>ผู้จอง:</strong> ${appointment.first_name} ${appointment.last_name}</p>
            <p class="text-sm text-gray-600"><strong>โรงพยาบาล:</strong> ${appointment.hospital}</p>
            <p class="text-sm text-gray-600"><strong>วันที่:</strong> ${formatDate(appointment.appointment_date)}</p>
            <p class="text-sm text-gray-600"><strong>เวลา:</strong> ${appointment.appointment_time}</p>
            <p class="text-sm text-gray-600"><strong>สถานะปัจจุบัน:</strong> ${appointment.status}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">สถานะใหม่</label>
            <select id="newStatus" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="รอการอนุมัติ" ${appointment.status === 'รอการอนุมัติ' ? 'selected' : ''}>รอการอนุมัติ</option>
              <option value="อนุมัติแล้ว" ${appointment.status === 'อนุมัติแล้ว' ? 'selected' : ''}>อนุมัติแล้ว</option>
              <option value="ปฏิเสธ" ${appointment.status === 'ปฏิเสธ' ? 'selected' : ''}>ปฏิเสธ</option>
              <option value="ยกเลิกการจอง" ${appointment.status === 'ยกเลิกการจอง' ? 'selected' : ''}>ยกเลิกการจอง</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'อัปเดตสถานะ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const newStatus = document.getElementById('newStatus').value;
        return { newStatus };
      }
    });

    if (formValues) {
      try {
        await updateAppointmentStatusAdmin(appointmentId, formValues.newStatus);
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'อัปเดตสถานะการจองเรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false
        });
        fetchData(); // รีเฟรชข้อมูล
      } catch (error) {
        console.error('Update appointment status error:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถอัปเดตสถานะได้'
        });
      }
    }
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">จัดการการจอง</h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">ตรวจสอบและอัปเดตสถานะการจองทั้งหมด</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">รายการจองทั้งหมด</h2>
            <div className="flex gap-3 sm:gap-4">
              <select
                value={appointmentFilter}
                onChange={(e) => setAppointmentFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">ทั้งหมด</option>
                <option value="รอการอนุมัติ">รอการอนุมัติ</option>
                <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
                <option value="ปฏิเสธ">ปฏิเสธ</option>
                <option value="ยกเลิกการจอง">ยกเลิกการจอง</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">ผู้จอง</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">โรงพยาบาล</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">วันที่</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">เวลา</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">สถานะ</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">วันที่สร้าง</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => {
                  // หาชื่อผู้ใช้จาก user_id
                  const user = users.find(u => u.id === appointment.user_id);
                  const userName = user ? user.name : 'ไม่ทราบ';
                  
                  return (
                    <tr key={appointment.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                        <div>
                          <div className="font-semibold">{userName}</div>
                          <div className="text-xs text-gray-500">
                            {appointment.first_name} {appointment.last_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{appointment.hospital}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{formatDate(appointment.appointment_date)}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{appointment.appointment_time}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">{getStatusBadge(appointment.status)}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                        {new Date(appointment.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <button 
                          onClick={() => handleEditAppointment(appointment.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          แก้ไข
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p className="text-gray-500 text-base sm:text-lg">ไม่พบการจองที่ตรงกับเงื่อนไข</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center text-gray-600 mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm">ระบบจัดการการจอง | สำหรับผู้ดูแลระบบ</p>
        </div>
      </div>
    </div>
  );
}
