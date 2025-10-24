import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { getUsers, getLocations, createAppointmentByStaff } from "../../services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

// ตั้งค่าไอคอน Marker เริ่มต้น
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export default function StaffAppointmentForm() {
  const [formData, setFormData] = useState({
    userId: "",
    fullName: "",
    phone: "",
    provinceId: "",
    districtId: "",
    subdistrictId: "",
    hospitalId: "",
    appointmentDate: "",
    appointmentTime: "",
    latitude: "",
    longitude: "",
  });

  const [users, setUsers] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  // โหลดผู้ใช้ทั้งหมด
  useEffect(() => {
    getUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error loading users:", err));
  }, []);

  // เมื่อเลือกผู้ใช้ ให้ populate ชื่อ เบอร์โทร
  useEffect(() => {
    if (formData.userId) {
      const user = users.find((u) => String(u.id) === String(formData.userId));
      if (user) {
        setFormData((prev) => ({
          ...prev,
          fullName: user.name || "",
          phone: user.phone || "",
        }));
      }
    }
  }, [formData.userId, users]);
  
  // โหลดจังหวัด + โรงพยาบาล
  useEffect(() => {
    getLocations()
      .then((res) => {
        const data = res.data;
        const provinceList = Object.keys(data.provinces).map((provName, idx) => ({
          id: idx + 1,
          name_th: provName,
          districts: data.provinces[provName].districts,
        }));
        setProvinces(provinceList);
        setHospitals(data.hospitals.map((name, i) => ({ id: i + 1, name })));
      })
      .catch((err) => console.error("Error loading locations:", err));
  }, []);

  // เมื่อเลือกจังหวัด
  useEffect(() => {
    if (formData.provinceId) {
      const selectedProvince = provinces.find(
        (p) => String(p.id) === String(formData.provinceId)
      );
      if (selectedProvince) {
        const districtList = Object.keys(selectedProvince.districts).map((name, i) => ({
          id: i + 1,
          name_th: name,
          subdistricts: selectedProvince.districts[name],
        }));
        setDistricts(districtList);
        setSubdistricts([]);
        setFormData({ ...formData, districtId: "", subdistrictId: "" });
      }
    }
  }, [formData.provinceId, provinces]);

  // เมื่อเลือกอำเภอ
  useEffect(() => {
    if (formData.districtId && districts.length > 0) {
      const selectedDistrict = districts.find(
        (d) => String(d.id) === String(formData.districtId)
      );
      if (selectedDistrict) {
        const subList = selectedDistrict.subdistricts.map((name, i) => ({
          id: i + 1,
          name_th: name,
        }));
        setSubdistricts(subList);
        setFormData({ ...formData, subdistrictId: "" });
      }
    }
  }, [formData.districtId, districts]);

  // ระบุตำแหน่ง
  const getLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "error",
        title: "ไม่รองรับ",
        text: "เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง",
        confirmButtonText: "ตกลง"
      });
      return;
    }
    
    // แสดง loading
    Swal.fire({
      title: "กำลังระบุตำแหน่ง...",
      text: "กรุณารอสักครู่",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({
          ...formData,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        
        Swal.fire({
          icon: "success",
          title: "ระบุตำแหน่งสำเร็จ!",
          text: "ตำแหน่งของคุณได้รับการบันทึกแล้ว",
          timer: 1500,
          showConfirmButton: false,
        });
      },
      (err) => {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถเข้าถึงตำแหน่งได้: " + err.message,
          confirmButtonText: "ตกลง"
        });
      }
    );
  };

  // กดปุ่ม "บันทึก"
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบ field ว่าง
    const requiredFields = ['userId', 'fullName', 'phone', 'provinceId', 'districtId', 'subdistrictId', 'hospitalId', 'appointmentDate', 'appointmentTime'];
    const emptyFields = requiredFields
      .filter(field => !formData[field])
      .map(field => {
        const fieldNames = {
          userId: 'ผู้ใช้',
          fullName: 'ชื่อ-นามสกุล',
          phone: 'เบอร์โทรศัพท์',
          provinceId: 'จังหวัด',
          districtId: 'อำเภอ',
          subdistrictId: 'ตำบล',
          hospitalId: 'โรงพยาบาล',
          appointmentDate: 'วันที่จอง',
          appointmentTime: 'เวลารับส่ง'
        };
        return fieldNames[field] || field;
      });
    
    if (emptyFields.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        text: "กรุณากรอกข้อมูลให้ครบ: " + emptyFields.join(", "),
      });
      return;
    }

    const provinceName = provinces.find((p) => String(p.id) === String(formData.provinceId))
      ?.name_th;
    const districtName = districts.find((d) => String(d.id) === String(formData.districtId))
      ?.name_th;
    const subdistrictName = subdistricts.find(
      (s) => String(s.id) === String(formData.subdistrictId)
    )?.name_th;
    const hospitalName = hospitals.find((h) => String(h.id) === String(formData.hospitalId))
      ?.name;

    const formattedDate = new Date(formData.appointmentDate).toISOString().split("T")[0];

    const payload = {
      userId: parseInt(formData.userId, 10),
      firstName: formData.fullName,
      lastName: "",
      phone: formData.phone,
      provinceName,
      districtName,
      subdistrictName,
      hospitalName,
      appointmentDate: formattedDate,
      appointmentTime: formData.appointmentTime,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      status: "รอการอนุมัติ",
    };

    try {
      const res = await createAppointmentByStaff(payload);
      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "บันทึกข้อมูลสำเร็จ!",
          text: "การจองได้รับการบันทึกเรียบร้อยแล้ว",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          setFormData({
            userId: "",
            fullName: "",
            phone: "",
            provinceId: "",
            districtId: "",
            subdistrictId: "",
            hospitalId: "",
            appointmentDate: "",
            appointmentTime: "",
            latitude: "",
            longitude: "",
          });
        });
      }
    } catch (error) {
      console.error("❌ Create appointment error:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.response?.data?.message || error.message || "ไม่สามารถบันทึกข้อมูลได้",
        confirmButtonText: "ตกลง"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">จองคิวรถรับ-ส่งแทนผู้ใช้</h1>
          <p className="text-lg text-gray-600">สำหรับเจ้าหน้าที่โรงพยาบาล</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* เลือกผู้ใช้ */}
            <div className="space-y-2">
              <label className="text-lg font-semibold text-gray-700 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                เลือกผู้ใช้
              </label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                required
              >
                <option value="">-- เลือกผู้ใช้ --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} (ID: {u.id})
                  </option>
                ))}
              </select>
            </div>

            {/* ชื่อ-นามสกุล */}
            <div className="space-y-2">
              <label className="text-lg font-semibold text-gray-700 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                placeholder="กรุณากรอกชื่อ-นามสกุล"
                required
              />
            </div>

            {/* เบอร์โทรศัพท์ */}
            <div className="space-y-2">
              <label className="text-lg font-semibold text-gray-700 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                placeholder="กรุณากรอกเบอร์โทรศัพท์"
                required
              />
            </div>

            {/* จังหวัด */}
            <div className="space-y-2">
              <label className="text-lg font-semibold text-gray-700 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                จังหวัด
              </label>
              <select
                value={formData.provinceId}
                onChange={(e) => setFormData({ ...formData, provinceId: e.target.value })}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                required
              >
                <option value="">-- เลือกจังหวัด --</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name_th}
                  </option>
                ))}
              </select>
            </div>

            {/* อำเภอ */}
            <div className="space-y-2">
              <label className="text-lg font-semibold text-gray-700 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                อำเภอ
              </label>
              <select
                value={formData.districtId}
                onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                required
              >
                <option value="">-- เลือกอำเภอ --</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_th}
                  </option>
                ))}
              </select>
            </div>

            {/* ตำบล */}
            <div className="space-y-2">
              <label className="text-lg font-semibold text-gray-700 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                ตำบล
              </label>
              <select
                value={formData.subdistrictId}
                onChange={(e) => setFormData({ ...formData, subdistrictId: e.target.value })}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                required
              >
                <option value="">-- เลือกตำบล --</option>
                {subdistricts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_th}
                  </option>
                ))}
              </select>
            </div>

            {/* โรงพยาบาล */}
            <div className="space-y-2">
              <label className="text-lg font-semibold text-gray-700 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                โรงพยาบาล
              </label>
              <select
                value={formData.hospitalId}
                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                required
              >
                <option value="">-- เลือกโรงพยาบาล --</option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* วันที่จอง */}
            <div className="space-y-2">
              <label className="text-lg font-semibold text-gray-700 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                วันที่จอง
              </label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                required
              />
            </div>

            {/* เวลารับส่ง */}
            <div className="space-y-2">
              <label className="text-lg font-semibold text-gray-700 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                เวลารับส่ง
              </label>
              <input
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                required
              />
            </div>

            {/* ปุ่มระบุตำแหน่ง */}
            <div className="pt-4">
              <button
                type="button"
                onClick={getLocation}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-bold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  ระบุตำแหน่งปัจจุบัน (ไม่บังคับ)
                </div>
              </button>
            </div>

            {/* แผนที่ */}
            {formData.latitude && formData.longitude && (
              <div className="mt-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    แผนที่ตำแหน่ง
                  </h3>
                  <div className="h-64 w-full rounded-lg overflow-hidden shadow-lg">
                    <MapContainer
                      center={[formData.latitude, formData.longitude]}
                      zoom={16}
                      className="h-full w-full"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <Marker
                        position={[formData.latitude, formData.longitude]}
                        draggable
                        eventHandlers={{
                          dragend: (e) => {
                            const pos = e.target.getLatLng();
                            setFormData({ ...formData, latitude: pos.lat, longitude: pos.lng });
                          },
                        }}
                      >
                        <Popup>📍 พิกัดผู้ใช้</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p><strong>ละติจูด:</strong> {formData.latitude}</p>
                    <p><strong>ลองจิจูด:</strong> {formData.longitude}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ปุ่มส่งฟอร์ม */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  บันทึกข้อมูลการจอง
                </div>
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">จองคิวรถรับ-ส่งแทนผู้ใช้ได้อย่างสะดวกและปลอดภัย</p>
          <p className="text-xs mt-1">ข้อมูลจะได้รับการบันทึกทันที</p>
        </div>
      </div>
    </div>
  );
}
