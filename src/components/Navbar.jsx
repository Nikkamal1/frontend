import React, { useState, useEffect, useRef } from "react";
import { FiMenu, FiUser, FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getUserAppointments, getAllAppointments } from "../services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function Navbar({ user, onLogout, onToggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [previousAppointments, setPreviousAppointments] = useState([]);
  const [previousAllAppointments, setPreviousAllAppointments] = useState([]);
  const navigate = useNavigate();
  
  // ใช้ useRef เพื่อเก็บข้อมูลการจองเก่าไว้
  const previousAppointmentsRef = useRef([]);
  const previousAllAppointmentsRef = useRef([]);

  // โหลดการแจ้งเตือนจาก localStorage
  useEffect(() => {
    if (user?.id) {
      const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
      if (savedNotifications) {
        try {
          const parsedNotifications = JSON.parse(savedNotifications);
          
          setNotifications(parsedNotifications);
          
          // นับจำนวนข้อความที่ยังไม่ได้อ่าน
          const unread = parsedNotifications.filter(notif => !notif.read).length;
          setUnreadCount(unread);
          
        } catch (error) {
        }
      }
    }
  }, [user?.id]);

  // โหลดข้อมูลการจองเก่าจาก localStorage และเริ่มการตรวจสอบ
  useEffect(() => {
    if (user?.id) {
      // โหลดข้อมูลเก่าจาก localStorage ก่อน
      if (user.role === "admin") {
        // สำหรับ admin: โหลดข้อมูลการจองทั้งหมด
        const savedAllAppointments = localStorage.getItem('all_appointments');
        if (savedAllAppointments) {
          try {
            const parsedAppointments = JSON.parse(savedAllAppointments);
            setPreviousAllAppointments(parsedAppointments);
            previousAllAppointmentsRef.current = parsedAppointments;
          } catch (error) {
          }
        }
      } else if (user.role === "staff") {
        // สำหรับ staff: โหลดข้อมูลการจองทั้งหมด
        const savedAppointments = localStorage.getItem(`appointments_${user.id}`);
        if (savedAppointments) {
          try {
            const parsedAppointments = JSON.parse(savedAppointments);
            setPreviousAppointments(parsedAppointments);
            previousAppointmentsRef.current = parsedAppointments;
          } catch (error) {
          }
        }
      } else {
        // สำหรับ user: โหลดข้อมูลการจองของตัวเอง
        const savedAppointments = localStorage.getItem(`appointments_${user.id}`);
        if (savedAppointments) {
          try {
            const parsedAppointments = JSON.parse(savedAppointments);
            setPreviousAppointments(parsedAppointments);
            previousAppointmentsRef.current = parsedAppointments;
          } catch (error) {
          }
        }
      }

      // เริ่มการตรวจสอบการเปลี่ยนแปลง
      fetchAppointments();
      // ตรวจสอบทุก 30 วินาที
      const interval = setInterval(fetchAppointments, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id, user?.role]);

  const fetchAppointments = async () => {
    try {
      if (user?.role === "admin") {
        // สำหรับแอดมิน: ตรวจสอบการจองใหม่
        const res = await getAllAppointments(1, 1000);
        const currentAppointments = res.data.appointments || [];
        
        if (previousAllAppointmentsRef.current.length > 0) {
          checkNewAppointments(previousAllAppointmentsRef.current, currentAppointments);
        }
        
        // บันทึกข้อมูลการจองทั้งหมดลงใน localStorage สำหรับ admin
        setPreviousAllAppointments(currentAppointments);
        previousAllAppointmentsRef.current = currentAppointments;
        localStorage.setItem('all_appointments', JSON.stringify(currentAppointments));
      } else if (user?.role === "staff") {
        // สำหรับ staff: ตรวจสอบการเปลี่ยนแปลงสถานะของทุกการจอง
        const res = await getAllAppointments(1, 1000);
        const allAppointments = res.data.appointments || [];
        
        // ตรวจสอบการเปลี่ยนแปลงสถานะ (รวมถึงครั้งแรกที่โหลด)
        if (previousAppointmentsRef.current.length > 0) {
          checkStatusChanges(previousAppointmentsRef.current, allAppointments);
        }
        
        // บันทึกข้อมูลการจองทั้งหมดลงใน localStorage สำหรับ staff
        setPreviousAppointments(allAppointments);
        previousAppointmentsRef.current = allAppointments;
        localStorage.setItem(`appointments_${user.id}`, JSON.stringify(allAppointments));
      } else {
        // สำหรับ user: ตรวจสอบการเปลี่ยนแปลงสถานะของตัวเองเท่านั้น
        const res = await getAllAppointments(1, 1000);
        const allAppointments = res.data.appointments || [];
        
        // กรองเฉพาะการจองของ user นี้
        const userAppointments = allAppointments.filter(apt => apt.user_id === user.id);
        
        // ตรวจสอบการเปลี่ยนแปลงสถานะ (รวมถึงครั้งแรกที่โหลด)
        if (previousAppointmentsRef.current.length > 0) {
          checkStatusChanges(previousAppointmentsRef.current, userAppointments);
        }
        
        // บันทึกข้อมูลการจองลงใน localStorage
        setPreviousAppointments(userAppointments);
        previousAppointmentsRef.current = userAppointments;
        localStorage.setItem(`appointments_${user.id}`, JSON.stringify(userAppointments));
      }
    } catch (err) {
    }
  };

  const checkStatusChanges = (oldAppointments, newAppointments) => {
    const changes = [];
    
    
    newAppointments.forEach(newAppointment => {
      const oldAppointment = oldAppointments.find(old => old.id === newAppointment.id);
      
      
      if (oldAppointment && oldAppointment.status !== newAppointment.status) {
        
        const change = {
          id: newAppointment.id,
          type: 'status_change',
          oldStatus: oldAppointment.status,
          newStatus: newAppointment.status,
          hospital: newAppointment.hospital,
          appointmentDate: newAppointment.appointment_date,
          appointmentTime: newAppointment.appointment_time,
          patientName: `${newAppointment.first_name} ${newAppointment.last_name}`,
          timestamp: new Date(),
          read: false
        };
        
        changes.push(change);
        
        // แสดง SweetAlert2 notification
        showStatusChangeNotification(change);
      }
    });
    
    if (changes.length > 0) {
      const newNotifications = [...changes, ...notifications];
      setNotifications(newNotifications);
      setUnreadCount(prev => prev + changes.length);
      saveNotificationsToStorage(newNotifications);
    }
  };

  const checkNewAppointments = (oldAppointments, newAppointments) => {
    const changes = [];
    
    
    // หาการจองใหม่ (ID ที่ไม่มีในรายการเก่า)
    newAppointments.forEach(newAppointment => {
      const isNew = !oldAppointments.find(old => old.id === newAppointment.id);
      
      
      if (isNew) {
        
        const change = {
          id: newAppointment.id,
          type: 'new_appointment',
          patientName: `${newAppointment.first_name} ${newAppointment.last_name}`,
          hospital: newAppointment.hospital,
          appointmentDate: newAppointment.appointment_date,
          appointmentTime: newAppointment.appointment_time,
          status: newAppointment.status,
          timestamp: new Date(),
          read: false
        };
        
        changes.push(change);
        
        // แสดง SweetAlert2 notification
        showNewAppointmentNotification(change);
      }
    });
    
    if (changes.length > 0) {
      const newNotifications = [...changes, ...notifications];
      setNotifications(newNotifications);
      setUnreadCount(prev => prev + changes.length);
      saveNotificationsToStorage(newNotifications);
    }
  };

  const showStatusChangeNotification = (change) => {
    const statusMessages = {
      'รอการอนุมัติ': 'รอการอนุมัติ',
      'อนุมัติแล้ว': 'ได้รับการอนุมัติแล้ว',
      'ปฏิเสธ': 'ถูกปฏิเสธ'
    };

    const statusColors = {
      'รอการอนุมัติ': '#f59e0b',
      'อนุมัติแล้ว': '#10b981',
      'ปฏิเสธ': '#ef4444'
    };

    Swal.fire({
      icon: 'info',
      title: user?.role === "staff" ? 'การจองได้รับการอนุมัติ!' : 'การจองได้รับการอัปเดต!',
      html: `
        <div class="text-left">
          ${user?.role === "staff" ? `<p class="mb-2"><strong>ผู้ป่วย:</strong> ${change.patientName || 'ไม่ทราบ'}</p>` : ''}
          <p class="mb-2"><strong>โรงพยาบาล:</strong> ${change.hospital}</p>
          <p class="mb-2"><strong>วันที่:</strong> ${new Date(change.appointmentDate).toLocaleDateString('th-TH')}</p>
          <p class="mb-2"><strong>เวลา:</strong> ${change.appointmentTime}</p>
          <p class="mb-0">
            <strong>สถานะ:</strong> 
            <span style="color: ${statusColors[change.newStatus]}">
              ${statusMessages[change.newStatus]}
            </span>
          </p>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'ดูรายละเอียด',
      showCancelButton: true,
      cancelButtonText: 'ปิด',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        if (user?.role === "staff") {
          navigate('/staff/bookings');
        } else {
          navigate('/user/bookings');
        }
      }
    });
  };

  const showNewAppointmentNotification = (change) => {
    Swal.fire({
      icon: 'success',
      title: 'มีการจองใหม่!',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>ผู้ป่วย:</strong> ${change.patientName}</p>
          <p class="mb-2"><strong>โรงพยาบาล:</strong> ${change.hospital}</p>
          <p class="mb-2"><strong>วันที่:</strong> ${new Date(change.appointmentDate).toLocaleDateString('th-TH')}</p>
          <p class="mb-2"><strong>เวลา:</strong> ${change.appointmentTime}</p>
          <p class="mb-0">
            <strong>สถานะ:</strong> 
            <span style="color: #f59e0b">
              ${change.status}
            </span>
          </p>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'จัดการการจอง',
      showCancelButton: true,
      cancelButtonText: 'ปิด',
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/admin/dashboard');
      }
    });
  };

  const handleProfile = () => {
    if (user?.id) {
      // ตรวจสอบ role ของ user เพื่อไปยัง profile ที่ถูกต้อง
      if (user.role === "admin") {
        navigate(`/admin/profile/${user.id}`);
      } else if (user.role === "staff") {
        navigate(`/staff/profile/${user.id}`);
      } else {
        navigate(`/user/profile/${user.id}`);
      }
    }
  };

  // บันทึกการแจ้งเตือนลงใน localStorage
  const saveNotificationsToStorage = (newNotifications) => {
    if (user?.id) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(newNotifications));
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    saveNotificationsToStorage(updatedNotifications);
  };

  // ลบการแจ้งเตือน
  const deleteNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
    setNotifications(updatedNotifications);
    
    // นับจำนวนข้อความที่ยังไม่ได้อ่านใหม่
    const unread = updatedNotifications.filter(notif => !notif.read).length;
    setUnreadCount(unread);
    
    saveNotificationsToStorage(updatedNotifications);
  };

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    // แปลง timestamp ให้เป็น Date object ถ้าเป็น string
    const notificationTime = new Date(timestamp);
    
    
    // ตรวจสอบว่า timestamp ถูกต้องหรือไม่
    if (isNaN(notificationTime.getTime())) {
      return 'เมื่อไม่นานมานี้';
    }
    
    const diff = now - notificationTime;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    
    const days = Math.floor(hours / 24);
    return `${days} วันที่แล้ว`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 border-b border-gray-200 shadow-lg flex items-center justify-between px-4 sm:px-6 z-50 backdrop-blur-sm">
      {/* Left Section */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button 
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:text-gray-800 hover:shadow-md" 
          onClick={onToggleSidebar}
        >
          <FiMenu size={20} />
        </button>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-800">ระบบจองรถรับ-ส่ง</h1>
            <p className="text-xs text-gray-500 -mt-1">โรงพยาบาล</p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-sm font-bold text-gray-800">จองรถ</h1>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 sm:p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:text-gray-800 group"
          >
            <FiBell size={18} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notificationOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto backdrop-blur-sm">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <FiBell className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">การแจ้งเตือน</h3>
                  </div>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                      >
                        อ่านทั้งหมด
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          setNotifications([]);
                          setUnreadCount(0);
                          saveNotificationsToStorage([]);
                        }}
                        className="text-sm text-red-600 hover:text-red-700 font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition-colors duration-200"
                      >
                        ลบทั้งหมด
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                      <FiBell className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium">ไม่มีการแจ้งเตือน</p>
                    <p className="text-xs text-gray-400 mt-1">เมื่อมีการอัปเดตสถานะจะแสดงที่นี่</p>
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div
                      key={index}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-all duration-200 ${
                        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-3 h-3 rounded-full mt-2 shadow-sm ${
                          notification.type === 'new_appointment' ? 'bg-purple-500' :
                          notification.newStatus === 'อนุมัติแล้ว' ? 'bg-green-500' :
                          notification.newStatus === 'ปฏิเสธ' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-gray-800">
                              {notification.type === 'new_appointment' ? 'มีการจองใหม่' : 'การจองได้รับการอัปเดต'}
                            </h4>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {formatNotificationTime(notification.timestamp)}
                            </span>
                          </div>
                          {notification.type === 'new_appointment' ? (
                            <>
                              <p className="text-sm text-gray-700 mb-1 font-medium">
                                ผู้ป่วย: {notification.patientName}
                              </p>
                              <p className="text-sm text-gray-700 mb-2 font-medium">
                                {notification.hospital}
                              </p>
                            </>
                          ) : (
                            <>
                              {user?.role === "staff" && notification.patientName && (
                                <p className="text-sm text-gray-700 mb-1 font-medium">
                                  ผู้ป่วย: {notification.patientName}
                                </p>
                              )}
                              <p className="text-sm text-gray-700 mb-2 font-medium">
                                {notification.hospital}
                              </p>
                            </>
                          )}
                          <p className="text-xs text-gray-500 mb-3">
                            {new Date(notification.appointmentDate).toLocaleDateString('th-TH')} • {notification.appointmentTime}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              notification.type === 'new_appointment' ? 'bg-purple-100 text-purple-800' :
                              notification.newStatus === 'อนุมัติแล้ว' ? 'bg-green-100 text-green-800' :
                              notification.newStatus === 'ปฏิเสธ' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {notification.type === 'new_appointment' ? notification.status : notification.newStatus}
                            </span>
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
                                title="ลบการแจ้งเตือน"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setNotificationOpen(false);
                      if (user?.role === "admin") {
                        navigate('/admin/dashboard');
                      } else if (user?.role === "staff") {
                        navigate('/staff/bookings');
                      } else {
                        navigate('/user/bookings');
                      }
                    }}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold py-3 bg-white rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-sm"
                  >
                    {user?.role === "admin" ? "จัดการการจอง" : "ดูการจองทั้งหมด"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 sm:gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:text-gray-900 group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <FiUser size={14} className="sm:w-4 sm:h-4 text-gray-600" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-800">{user?.name || "ผู้ใช้"}</p>
              <p className="text-xs text-gray-500"></p>
            </div>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 sm:w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 backdrop-blur-sm">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                    <FiUser size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{user?.name || "ผู้ใช้"}</p>
                    <p className="text-xs text-gray-500">{user?.email || "ผู้ป่วย"}</p>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleProfile();
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
                  disabled={!user?.id}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  แก้ไขโปรไฟล์
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium mt-2"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  ออกจากระบบ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
