import React, { useState, useEffect } from "react";
import { getAllUsers, updateUser, createUser, deleteUser, adminUpdatePassword } from "../../services/api";
import { validatePassword } from "../../utils/security";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRes = await getAllUsers();
      const usersData = usersRes.data || [];
      setUsers(usersData);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
        confirmButtonText: "ตกลง"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (roleId) => {
    const roleConfig = {
      1: { color: 'bg-blue-100 text-blue-800', text: 'ผู้ใช้' },
      2: { color: 'bg-green-100 text-green-800', text: 'เจ้าหน้าที่' },
      3: { color: 'bg-purple-100 text-purple-800', text: 'แอดมิน' }
    };
    
    const config = roleConfig[roleId] || { color: 'bg-gray-100 text-gray-800', text: 'ไม่ทราบ' };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    if (userFilter === "all") return true;
    if (userFilter === "admin") return user.role_id === 3;
    if (userFilter === "staff") return user.role_id === 2;
    if (userFilter === "user") return user.role_id === 1;
    return true;
  });

  // ฟังก์ชันจัดการผู้ใช้
  const handleEditUser = async (userId) => {
    const userToEdit = users.find(u => u.id === userId);
    if (!userToEdit) return;

    const { value: formValues } = await Swal.fire({
      title: 'แก้ไขข้อมูลผู้ใช้',
      html: `
        <div class="text-left space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
            <input id="name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent" value="${userToEdit.name}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input id="email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent" value="${userToEdit.email}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">สิทธิ์</label>
            <select id="role_id" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="1" ${userToEdit.role_id === 1 ? 'selected' : ''}>ผู้ใช้ทั่วไป</option>
              <option value="2" ${userToEdit.role_id === 2 ? 'selected' : ''}>เจ้าหน้าที่</option>
              <option value="3" ${userToEdit.role_id === 3 ? 'selected' : ''}>แอดมิน</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
            <select id="is_active" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="1" ${userToEdit.is_active ? 'selected' : ''}>ใช้งาน</option>
              <option value="0" ${!userToEdit.is_active ? 'selected' : ''}>ไม่ใช้งาน</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const role_id = parseInt(document.getElementById('role_id').value);
        const is_active = parseInt(document.getElementById('is_active').value);

        if (!name || !email) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
          return false;
        }

        return { name, email, role_id, is_active };
      }
    });

    if (formValues) {
      try {
        await updateUser(userId, formValues);
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false
        });
        fetchUsers(); // รีเฟรชข้อมูล
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถอัปเดตข้อมูลได้'
        });
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: `คุณต้องการลบผู้ใช้ "${userToDelete.name}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(userId);
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'ลบผู้ใช้เรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false
        });
        fetchUsers(); // รีเฟรชข้อมูล
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถลบผู้ใช้ได้'
        });
      }
    }
  };

  const handleChangePassword = async (userId) => {
    const userToChange = users.find(u => u.id === userId);
    if (!userToChange) return;

    const { value: formValues } = await Swal.fire({
      title: 'เปลี่ยนรหัสผ่าน',
      html: `
        <div class="text-left space-y-4">
          <div class="bg-blue-50 p-3 rounded-lg">
            <p class="text-sm text-blue-800">
              <strong>ผู้ใช้:</strong> ${userToChange.name}<br>
              <strong>อีเมล:</strong> ${userToChange.email}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
            <input id="newPassword" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="กรอกรหัสผ่านใหม่">
            <p class="text-xs text-gray-500 mt-1">รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร มีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
            <input id="confirmPassword" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="ยืนยันรหัสผ่านใหม่">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'เปลี่ยนรหัสผ่าน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!newPassword || !confirmPassword) {
          Swal.showValidationMessage('กรุณากรอกรหัสผ่านให้ครบถ้วน');
          return false;
        }

        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage('รหัสผ่านไม่ตรงกัน');
          return false;
        }

        // ตรวจสอบความแข็งแกร่งของรหัสผ่าน
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
          Swal.showValidationMessage(passwordValidation.message);
          return false;
        }

        return { newPassword };
      }
    });

    if (formValues) {
      try {
        await adminUpdatePassword(userId, { newPassword: formValues.newPassword });
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้'
        });
      }
    }
  };

  const handleAddUser = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'เพิ่มผู้ใช้ใหม่',
      html: `
        <div class="text-left space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
            <input id="name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="กรอกชื่อ-นามสกุล">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input id="email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="กรอกอีเมล">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input id="password" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="กรอกรหัสผ่าน">
            <p class="text-xs text-gray-500 mt-1">รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร มีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">สิทธิ์</label>
            <select id="role_id" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="1">ผู้ใช้ทั่วไป</option>
              <option value="2">เจ้าหน้าที่</option>
              <option value="3">แอดมิน</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'เพิ่มผู้ใช้',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role_id = parseInt(document.getElementById('role_id').value);

        if (!name || !email || !password) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
          return false;
        }

        // ตรวจสอบความแข็งแกร่งของรหัสผ่าน
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          Swal.showValidationMessage(passwordValidation.message);
          return false;
        }

        return { name, email, password, role_id };
      }
    });

    if (formValues) {
      try {
        await createUser(formValues);
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'เพิ่มผู้ใช้เรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false
        });
        fetchUsers(); // รีเฟรชข้อมูล
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถเพิ่มผู้ใช้ได้'
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">จัดการผู้ใช้</h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">เพิ่ม แก้ไข และลบผู้ใช้ในระบบ</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">รายชื่อผู้ใช้ทั้งหมด</h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">ทั้งหมด</option>
                <option value="admin">แอดมิน</option>
                <option value="staff">เจ้าหน้าที่</option>
                <option value="user">ผู้ใช้ทั่วไป</option>
              </select>
              <button 
                onClick={handleAddUser}
                className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm sm:text-base">เพิ่มผู้ใช้</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">อีเมล</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">สิทธิ์</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">สถานะ</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">วันที่สร้าง</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{user.id}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">{user.name}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 break-all">{user.email}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">{getRoleBadge(user.role_id)}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                      {new Date(user.created_at).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button 
                          onClick={() => handleEditUser(user.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          แก้ไข
                        </button>
                        <button 
                          onClick={() => handleChangePassword(user.id)}
                          className="text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-md hover:bg-green-50 transition-colors"
                        >
                          เปลี่ยนรหัสผ่าน
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p className="text-gray-500 text-base sm:text-lg">ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center text-gray-600 mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm">ระบบจัดการผู้ใช้ | สำหรับผู้ดูแลระบบ</p>
        </div>
      </div>
    </div>
  );
}
