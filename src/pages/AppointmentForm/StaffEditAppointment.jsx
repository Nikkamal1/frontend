import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAppointmentById, updateAppointmentByUser, getLocations } from "../../services/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function StaffEditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    province: "",
    district: "",
    subdistrict: "",
    hospital: "",
    appointment_date: "",
    appointment_time: "",
    latitude: "",
    longitude: ""
  });

  // โหลดข้อมูลการจอง
  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await getAppointmentById(id);
      const appointment = response.data;
      
      setFormData({
        firstName: appointment.first_name || "",
        lastName: appointment.last_name || "",
        phone: appointment.phone || "",
        province: appointment.province || "",
        district: appointment.district || "",
        subdistrict: appointment.subdistrict || "",
        hospital: appointment.hospital || "",
        appointment_date: appointment.appointment_date || "",
        appointment_time: appointment.appointment_time || "",
        latitude: appointment.latitude || "",
        longitude: appointment.longitude || ""
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลการจองได้",
        confirmButtonText: "ตกลง"
      }).then(() => {
        navigate("/staff/bookings");
      });
    } finally {
      setLoading(false);
    }
  };

  // โหลดข้อมูลสถานที่
  const fetchLocations = async () => {
    try {
      const response = await getLocations();
      const data = response.data;
      
      // Transform provinces data
      const provinceList = Object.keys(data.provinces).map((provName, idx) => ({
        id: idx + 1,
        name_th: provName,
        districts: data.provinces[provName].districts,
      }));
      setProvinces(provinceList);
      
      // Transform hospitals data
      setHospitals(data.hospitals.map((name, i) => ({ id: i + 1, name })));
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchAppointment();
    fetchLocations();
  }, [id]);

  // Populate districts and subdistricts when appointment data is loaded
  useEffect(() => {
    if (formData.province && provinces.length > 0) {
      const selectedProvince = provinces.find(
        (p) => p.name_th === formData.province
      );
      if (selectedProvince) {
        const districtList = Object.keys(selectedProvince.districts).map((name, i) => ({
          id: i + 1,
          name_th: name,
          subdistricts: selectedProvince.districts[name],
        }));
        setDistricts(districtList);
        
        // If district is already set, populate subdistricts
        if (formData.district) {
          const selectedDistrict = districtList.find(
            (d) => d.name_th === formData.district
          );
          if (selectedDistrict) {
            const subdistrictList = selectedDistrict.subdistricts.map((name, i) => ({
              id: i + 1,
              name_th: name,
            }));
            setSubdistricts(subdistrictList);
          }
        }
      }
    }
  }, [formData.province, formData.district, provinces]);

  // เมื่อเลือกจังหวัด
  useEffect(() => {
    if (formData.province) {
      const selectedProvince = provinces.find(
        (p) => p.name_th === formData.province
      );
      if (selectedProvince) {
        const districtList = Object.keys(selectedProvince.districts).map((name, i) => ({
          id: i + 1,
          name_th: name,
          subdistricts: selectedProvince.districts[name],
        }));
        setDistricts(districtList);
        setSubdistricts([]);
        setFormData(prev => ({ ...prev, district: "", subdistrict: "" }));
      }
    }
  }, [formData.province, provinces]);

  // เมื่อเลือกอำเภอ
  useEffect(() => {
    if (formData.district) {
      const selectedDistrict = districts.find(
        (d) => d.name_th === formData.district
      );
      if (selectedDistrict) {
        const subdistrictList = selectedDistrict.subdistricts.map((name, i) => ({
          id: i + 1,
          name_th: name,
        }));
        setSubdistricts(subdistrictList);
        setFormData(prev => ({ ...prev, subdistrict: "" }));
      }
    }
  }, [formData.district, districts]);

  // เปลี่ยนค่าในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ระบุตำแหน่งปัจจุบัน
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "error",
        title: "ไม่รองรับการระบุตำแหน่ง",
        text: "เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง",
        confirmButtonText: "ตกลง"
      });
      return;
    }

    Swal.fire({
      title: "กำลังระบุตำแหน่ง...",
      text: "กรุณารอสักครู่",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));
        
        Swal.fire({
          icon: "success",
          title: "ระบุตำแหน่งสำเร็จ",
          text: `ตำแหน่ง: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          confirmButtonText: "ตกลง"
        });
      },
      (error) => {
        let errorMessage = "ไม่สามารถระบุตำแหน่งได้";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "ผู้ใช้ไม่อนุญาตให้เข้าถึงตำแหน่ง";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "ข้อมูลตำแหน่งไม่พร้อมใช้งาน";
            break;
          case error.TIMEOUT:
            errorMessage = "การขอตำแหน่งหมดเวลา";
            break;
        }
        
        Swal.fire({
          icon: "error",
          title: "ไม่สามารถระบุตำแหน่งได้",
          text: errorMessage,
          confirmButtonText: "ตกลง"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // ส่งข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    const requiredFields = [
      { key: 'firstName', name: 'ชื่อ-นามสกุล' },
      { key: 'phone', name: 'เบอร์โทรศัพท์' },
      { key: 'province', name: 'จังหวัด' },
      { key: 'district', name: 'อำเภอ' },
      { key: 'subdistrict', name: 'ตำบล' },
      { key: 'hospital', name: 'โรงพยาบาล' },
      { key: 'appointment_date', name: 'วันที่นัดหมาย' },
      { key: 'appointment_time', name: 'เวลานัดหมาย' }
    ];

    const missingFields = requiredFields.filter(field => !formData[field.key] || formData[field.key].trim() === '');
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => field.name).join(', ');
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: `กรุณากรอกข้อมูลให้ครบ: ${fieldNames}`,
        confirmButtonText: "ตกลง"
      });
      return;
    }

    // ตรวจสอบเบอร์โทรศัพท์
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/-/g, ''))) {
      Swal.fire({
        icon: "warning",
        title: "เบอร์โทรศัพท์ไม่ถูกต้อง",
        text: "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก",
        confirmButtonText: "ตกลง"
      });
      return;
    }

    // ตรวจสอบวันที่
    const selectedDate = new Date(formData.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      Swal.fire({
        icon: "warning",
        title: "วันที่ไม่ถูกต้อง",
        text: "ไม่สามารถเลือกวันที่ในอดีตได้",
        confirmButtonText: "ตกลง"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // แยกชื่อและนามสกุล
      const nameParts = formData.firstName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const payload = {
        first_name: firstName,
        last_name: lastName,
        phone: formData.phone,
        province: formData.province,
        district: formData.district,
        subdistrict: formData.subdistrict,
        hospital: formData.hospital,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      await updateAppointmentByUser(id, payload);
      
      Swal.fire({
        icon: "success",
        title: "แก้ไขการจองสำเร็จ",
        text: "ข้อมูลการจองได้รับการอัพเดทแล้ว",
        confirmButtonText: "ตกลง"
      }).then(() => {
        navigate("/staff/bookings");
      });
      
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.response?.data?.message || "ไม่สามารถแก้ไขการจองได้",
        confirmButtonText: "ตกลง"
      });
    } finally {
      setSubmitting(false);
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">แก้ไขการจอง</h1>
          <p className="text-lg text-gray-600">สำหรับเจ้าหน้าที่โรงพยาบาล</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                ข้อมูลส่วนตัว
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* ชื่อ-นามสกุล */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    ชื่อ-นามสกุล *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                    placeholder="กรอกชื่อ-นามสกุล"
                    required
                  />
                </div>

                {/* เบอร์โทรศัพท์ */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    เบอร์โทรศัพท์ *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                    placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location Information Section */}
            <div className="bg-green-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                ข้อมูลสถานที่
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* จังหวัด */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    จังหวัด *
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-gray-50"
                    required
                  >
                    <option value="">เลือกจังหวัด</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.name_th}>
                        {province.name_th}
                      </option>
                    ))}
                  </select>
                </div>

                {/* อำเภอ */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    อำเภอ *
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-gray-50"
                    required
                  >
                    <option value="">เลือกอำเภอ</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.name_th}>
                        {district.name_th}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ตำบล */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    ตำบล *
                  </label>
                  <select
                    name="subdistrict"
                    value={formData.subdistrict}
                    onChange={handleChange}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-gray-50"
                    required
                  >
                    <option value="">เลือกตำบล</option>
                    {subdistricts.map((subdistrict) => (
                      <option key={subdistrict.id} value={subdistrict.name_th}>
                        {subdistrict.name_th}
                      </option>
                    ))}
                  </select>
                </div>

                {/* โรงพยาบาล */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    โรงพยาบาล *
                  </label>
                  <select
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleChange}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-gray-50"
                    required
                  >
                    <option value="">เลือกโรงพยาบาล</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.name}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Appointment Information Section */}
            <div className="bg-yellow-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                ข้อมูลการนัดหมาย
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* วันที่นัดหมาย */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    วันที่นัดหมาย *
                  </label>
                  <input
                    type="date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-gray-50"
                    required
                  />
                </div>

                {/* เวลานัดหมาย */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    เวลานัดหมาย *
                  </label>
                  <input
                    type="time"
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleChange}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-gray-50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-purple-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                ตำแหน่งปัจจุบัน
              </h2>
              
              <div className="mb-4">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    ระบุตำแหน่งปัจจุบัน
                  </div>
                </button>
              </div>

              {/* Map Display */}
              {(formData.latitude && formData.longitude) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    แผนที่ตำแหน่ง
                  </h3>
                  <div className="mb-4">
                    <iframe
                      src={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}&z=15&output=embed`}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      title="แผนที่ตำแหน่ง"
                      className="w-full rounded-lg shadow-lg"
                    ></iframe>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>ละติจูด:</strong> {formData.latitude}</p>
                    <p><strong>ลองจิจูด:</strong> {formData.longitude}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/staff/bookings")}
                className="flex-1 py-4 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    กำลังบันทึก...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    บันทึกการแก้ไข
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>ระบบจองรถรับ-ส่งโรงพยาบาล | สำหรับเจ้าหน้าที่</p>
        </div>
      </div>
    </div>
  );
}
