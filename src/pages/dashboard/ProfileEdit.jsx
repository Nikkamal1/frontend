import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, updatePassword, deleteAccount } from "../../services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ 
    currentPassword: "", 
    newPassword: "", 
    confirmPassword: "" 
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      fetchProfile(userData.id);
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const fetchProfile = async (userId) => {
    try {
      setLoading(true);
      const { data } = await getProfile(userId);
      setForm({ name: data.name, email: data.email });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้",
        confirmButtonText: "ตกลง"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(user.id, form);
      
      // อัปเดต localStorage และ sessionStorage ด้วยข้อมูลใหม่
      const updatedUser = { ...user, name: form.name, email: form.email };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      
      Swal.fire({
        icon: "success",
        title: "บันทึกข้อมูลสำเร็จ!",
        text: "ข้อมูลโปรไฟล์ได้รับการอัปเดตแล้ว",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        // ตรวจสอบ role เพื่อไปยัง dashboard ที่ถูกต้อง
        if (user.role === "staff") {
          navigate("/staff/dashboard");
        } else {
          user.role === "staff" ? navigate("/staff/dashboard") : navigate("/user/dashboard");
        }
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้",
        confirmButtonText: "ตกลง"
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // ตรวจสอบรหัสผ่านใหม่
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณากรอกรหัสผ่านใหม่ให้ตรงกัน",
        confirmButtonText: "ตกลง"
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "รหัสผ่านสั้นเกินไป",
        text: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        confirmButtonText: "ตกลง"
      });
      return;
    }

    try {
      await updatePassword(user.id, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      // รีเซ็ตฟอร์ม
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      Swal.fire({
        icon: "success",
        title: "เปลี่ยนรหัสผ่านสำเร็จ!",
        text: "รหัสผ่านของคุณได้รับการอัปเดตแล้ว",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      
      // ตรวจสอบว่าเป็น 404 หรือไม่
      if (err.response?.status === 404) {
        Swal.fire({
          icon: "info",
          title: "ฟีเจอร์ยังไม่พร้อมใช้งาน",
          text: "การเปลี่ยนรหัสผ่านยังไม่พร้อมใช้งานในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
          confirmButtonText: "ตกลง"
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: err.response?.data?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้",
          confirmButtonText: "ตกลง"
        });
      }
    }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ลบบัญชีผู้ใช้",
      html: `
        <div class="text-left">
          <p class="mb-3 text-red-600 font-bold">⚠️ การลบบัญชีไม่สามารถย้อนกลับได้!</p>
          <p class="mb-2">• ข้อมูลการจองทั้งหมดจะถูกลบ</p>
          <p class="mb-2">• ข้อมูลส่วนตัวจะถูกลบ</p>
          <p class="mb-3">• ไม่สามารถกู้คืนข้อมูลได้</p>
          <p class="text-sm text-gray-600">กรุณาพิมพ์ <strong>"DELETE"</strong> เพื่อยืนยัน</p>
        </div>
      `,
      input: "text",
      inputPlaceholder: "พิมพ์ DELETE",
      showCancelButton: true,
      confirmButtonText: "ลบบัญชี",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      inputValidator: (value) => {
        if (value !== "DELETE") {
          return "กรุณาพิมพ์ DELETE ให้ถูกต้อง";
        }
      }
    });

    if (result.isConfirmed) {
      try {
        await deleteAccount(user.id);
        
        // ลบข้อมูลจาก storage
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        
        Swal.fire({
          icon: "success",
          title: "ลบบัญชีสำเร็จ",
          text: "บัญชีของคุณถูกลบเรียบร้อยแล้ว",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/login");
        });
      } catch (err) {
        console.error(err);
        
        // ตรวจสอบว่าเป็น 404 หรือไม่
        if (err.response?.status === 404) {
          Swal.fire({
            icon: "info",
            title: "ฟีเจอร์ยังไม่พร้อมใช้งาน",
            text: "การลบบัญชียังไม่พร้อมใช้งานในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
            confirmButtonText: "ตกลง"
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: err.response?.data?.message || "ไม่สามารถลบบัญชีได้",
            confirmButtonText: "ตกลง"
          });
        }
      }
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">จัดการบัญชี</h1>
          <p className="text-lg text-gray-600">ปรับปรุงข้อมูลส่วนตัวและความปลอดภัย</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === "profile"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  ข้อมูลส่วนตัว
                </div>
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === "password"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  รหัสผ่าน
                </div>
              </button>
              <button
                onClick={() => setActiveTab("danger")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === "danger"
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  โซนอันตราย
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">ข้อมูลส่วนตัว</h2>
                <p className="text-gray-600">แก้ไขข้อมูลส่วนตัวของคุณ</p>
              </div>
              
              {/* ชื่อ */}
              <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-700 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                  placeholder="กรุณากรอกชื่อ-นามสกุล"
                  required
                />
              </div>

              {/* อีเมล */}
              <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-700 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  อีเมล
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                  placeholder="กรุณากรอกอีเมล"
                  required
                />
              </div>

              {/* ปุ่มส่งฟอร์ม */}
              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-xl font-bold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    บันทึกข้อมูล
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => user.role === "staff" ? navigate("/staff/dashboard") : navigate("/user/dashboard")}
                  className="flex-1 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xl font-bold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    ยกเลิก
                  </div>
                </button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">เปลี่ยนรหัสผ่าน</h2>
                <p className="text-gray-600">อัปเดตรหัสผ่านเพื่อความปลอดภัย</p>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center justify-center text-yellow-700">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm font-medium">ฟีเจอร์นี้ยังอยู่ในระหว่างการพัฒนา</span>
                  </div>
                </div>
              </div>
              
              {/* รหัสผ่านปัจจุบัน */}
              <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-700 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  รหัสผ่านปัจจุบัน
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                  placeholder="กรุณากรอกรหัสผ่านปัจจุบัน"
                  required
                />
              </div>

              {/* รหัสผ่านใหม่ */}
              <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-700 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                  placeholder="กรุณากรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                  required
                />
              </div>

              {/* ยืนยันรหัสผ่านใหม่ */}
              <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-700 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                  placeholder="กรุณากรอกรหัสผ่านใหม่อีกครั้ง"
                  required
                />
              </div>

              {/* ปุ่มส่งฟอร์ม */}
              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    เปลี่ยนรหัสผ่าน
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => user.role === "staff" ? navigate("/staff/dashboard") : navigate("/user/dashboard")}
                  className="flex-1 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xl font-bold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    ยกเลิก
                  </div>
                </button>
              </div>
            </form>
          )}

          {/* Danger Zone Tab */}
          {activeTab === "danger" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-red-600 mb-2">โซนอันตราย</h2>
                <p className="text-gray-600">การดำเนินการที่อาจส่งผลกระทบต่อบัญชีของคุณ</p>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center justify-center text-yellow-700">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm font-medium">ฟีเจอร์นี้ยังอยู่ในระหว่างการพัฒนา</span>
                  </div>
                </div>
              </div>

              {/* Delete Account Section */}
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-800 mb-2">ลบบัญชีผู้ใช้</h3>
                    <p className="text-red-700 mb-4">
                      การลบบัญชีจะทำให้ข้อมูลทั้งหมดถูกลบอย่างถาวรและไม่สามารถกู้คืนได้
                    </p>
                    <ul className="text-sm text-red-600 mb-4 space-y-1">
                      <li>• ข้อมูลการจองทั้งหมดจะถูกลบ</li>
                      <li>• ข้อมูลส่วนตัวจะถูกลบ</li>
                      <li>• ไม่สามารถเข้าถึงระบบได้อีก</li>
                    </ul>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        ลบบัญชีผู้ใช้
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <div className="pt-6">
                <button
                  onClick={() => user.role === "staff" ? navigate("/staff/dashboard") : navigate("/user/dashboard")}
                  className="w-full py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xl font-bold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    กลับไปหน้าหลัก
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">แก้ไขข้อมูลโปรไฟล์ได้อย่างสะดวกและปลอดภัย</p>
          <p className="text-xs mt-1">ข้อมูลจะได้รับการอัปเดตทันที</p>
        </div>
      </div>
    </div>
  );
}
