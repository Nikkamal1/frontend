import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLocations, getAppointmentById, updateAppointmentByUser } from "../../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function EditAppointment() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [formData, setFormData] = useState({
        firstName: "",
        phone: "",
        province: "",
        district: "",
        subdistrict: "",
        hospital: "",
        appointment_date: "",
        appointment_time: "",
        latitude: "",
        longitude: "",
    });
    const [loading, setLoading] = useState(true);

    const [locations, setLocations] = useState(null);
    const [districts, setDistricts] = useState([]);
    const [subdistricts, setSubdistricts] = useState([]);
    const [hospitals, setHospitals] = useState([]);

    // โหลด appointment และ locations
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [appRes, locRes] = await Promise.all([getAppointmentById(id), getLocations()]);
                setAppointment(appRes.data);
                
                // รวมชื่อ-นามสกุลเป็นฟิลด์เดียว
                const fullName = `${appRes.data.first_name || ''} ${appRes.data.last_name || ''}`.trim();
                
                setFormData({
                    firstName: fullName,
                    phone: appRes.data.phone || "",
                    province: appRes.data.province || "",
                    district: appRes.data.district || "",
                    subdistrict: appRes.data.subdistrict || "",
                    hospital: appRes.data.hospital || "",
                    appointment_date: appRes.data.appointment_date?.split("T")[0] || "",
                    appointment_time: appRes.data.appointment_time || "",
                    latitude: appRes.data.latitude || "",
                    longitude: appRes.data.longitude || "",
                });
                
                setLocations(locRes.data);
                setHospitals(locRes.data.hospitals || []);
                setLoading(false);
            } catch (err) {
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาด",
                    text: "ไม่สามารถโหลดข้อมูลได้",
                    confirmButtonText: "ตกลง"
                }).then(() => {
                    navigate("/user/bookings");
                });
            }
        };
        fetchData();
    }, [id, navigate]);

    // อัปเดต districts เมื่อ province เปลี่ยน
    useEffect(() => {
        if (!formData.province || !locations) {
            setDistricts([]);
            setFormData(prev => ({ ...prev, district: "", subdistrict: "" }));
            return;
        }
        const provData = locations.provinces[formData.province];
        setDistricts(provData ? Object.keys(provData.districts) : []);
        setFormData(prev => ({ ...prev, district: "", subdistrict: "" }));
        setSubdistricts([]);
    }, [formData.province, locations]);

    // อัปเดต subdistricts เมื่อ district เปลี่ยน
    useEffect(() => {
        if (!formData.province || !formData.district || !locations) {
            setSubdistricts([]);
            setFormData(prev => ({ ...prev, subdistrict: "" }));
            return;
        }
        const provData = locations.provinces[formData.province];
        const subs = provData?.districts[formData.district] || [];
        setSubdistricts(subs);
        setFormData(prev => ({ ...prev, subdistrict: "" }));
    }, [formData.province, formData.district, locations]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        // แยกชื่อ-นามสกุลจากฟิลด์เดียว
        const nameParts = formData.firstName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const updateData = {
            ...formData,
            first_name: firstName,
            last_name: lastName,
        };
        
        try {
            await updateAppointmentByUser(id, updateData);
            Swal.fire({
                icon: "success",
                title: "แก้ไขข้อมูลสำเร็จ!",
                text: "ข้อมูลการจองได้รับการอัปเดตแล้ว",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => {
                navigate("/user/bookings");
            });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: "ไม่สามารถบันทึกการแก้ไขได้",
                confirmButtonText: "ตกลง"
            });
        }
    };

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
                setFormData(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                }));
                
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

    if (loading) return <p className="text-center mt-8">⏳ กำลังโหลดข้อมูล...</p>;
    if (!appointment) return <p className="text-center text-red-500">ไม่พบการจอง</p>;

    if (appointment.status !== "รอการอนุมัติ") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-4">ไม่สามารถแก้ไขได้</h2>
                        <p className="text-gray-700 mb-6">
                            การจองนี้มีสถานะ <span className="font-semibold text-red-600">{appointment.status}</span> แล้ว<br />
                            ไม่สามารถแก้ไขได้
                        </p>
                        <button
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold"
                            onClick={() => navigate("/user/bookings")}
                        >
                            <div className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                กลับไปหน้ารายการ
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">แก้ไขการจอง</h1>
                    <p className="text-lg text-gray-600">ปรับปรุงข้อมูลการจองรถรับ-ส่ง</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    <form onSubmit={handleSave} className="space-y-6">
                        
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
                                name="firstName"
                                value={formData.firstName || ""}
                                onChange={handleChange}
                                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                                placeholder="กรุณากรอกชื่อ-นามสกุล"
                                required
                            />
                        </div>

                        {/* เบอร์โทร */}
                        <div className="space-y-2">
                            <label className="text-lg font-semibold text-gray-700 flex items-center">
                                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                เบอร์โทรศัพท์
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone || ""}
                                onChange={handleChange}
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
                                name="province"
                                value={formData.province || ""}
                                onChange={handleChange}
                                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                                required
                            >
                                <option value="">-- เลือกจังหวัด --</option>
                                {locations &&
                                    Object.keys(locations.provinces).map((prov) => (
                                        <option key={prov} value={prov}>{prov}</option>
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
                                name="district"
                                value={formData.district || ""}
                                onChange={handleChange}
                                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                                required
                            >
                                <option value="">-- เลือกอำเภอ --</option>
                                {districts.map((d) => (
                                    <option key={d} value={d}>{d}</option>
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
                                name="subdistrict"
                                value={formData.subdistrict || ""}
                                onChange={handleChange}
                                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                                required
                            >
                                <option value="">-- เลือกตำบล --</option>
                                {subdistricts.map((s) => (
                                    <option key={s} value={s}>{s}</option>
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
                                name="hospital"
                                value={formData.hospital || ""}
                                onChange={handleChange}
                                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                                required
                            >
                                <option value="">-- เลือกโรงพยาบาล --</option>
                                {hospitals.map((h) => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                        </div>

                        {/* วันที่และเวลา */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700 flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    วันที่จอง
                                </label>
                                <input
                                    type="date"
                                    name="appointment_date"
                                    value={formData.appointment_date || ""}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700 flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    เวลารับส่ง
                                </label>
                                <input
                                    type="time"
                                    name="appointment_time"
                                    value={formData.appointment_time || ""}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                                    required
                                />
                            </div>
                        </div>

                        {/* ปุ่มระบุตำแหน่ง */}
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div>
                                        <h3 className="text-lg font-semibold text-green-800">ตำแหน่งปัจจุบัน</h3>
                                        <p className="text-sm text-green-600">คลิกเพื่อระบุตำแหน่งของคุณ</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={getLocation}
                                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-semibold text-lg"
                                >
                                    ระบุตำแหน่ง
                                </button>
                            </div>
                        </div>

                        {/* แผนที่ */}
                        {formData.latitude && formData.longitude && (
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    แผนที่ตำแหน่ง
                                </h3>
                                <div className="h-80 w-full rounded-xl overflow-hidden shadow-lg">
                                    <MapContainer
                                        center={[formData.latitude, formData.longitude]}
                                        zoom={16}
                                        scrollWheelZoom={false}
                                        className="h-full w-full"
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution="&copy; OpenStreetMap contributors"
                                        />
                                        <Marker
                                            position={[formData.latitude, formData.longitude]}
                                            draggable={true}
                                            eventHandlers={{
                                                dragend: (event) => {
                                                    const marker = event.target;
                                                    const position = marker.getLatLng();
                                                    setFormData({
                                                        ...formData,
                                                        latitude: position.lat,
                                                        longitude: position.lng,
                                                    });
                                                },
                                            }}
                                        >
                                            <Popup>
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-blue-600">📍 ตำแหน่งของคุณ</div>
                                                    <div className="text-sm text-gray-600 mt-1">ลากหมุดเพื่อเปลี่ยนตำแหน่งได้</div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                                
                                {/* แสดงค่าพิกัด */}
                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white rounded-lg p-3 text-center">
                                        <p className="font-semibold text-gray-700">ละติจูด</p>
                                        <p className="text-blue-600 font-mono">{formData.latitude.toFixed(6)}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 text-center">
                                        <p className="font-semibold text-gray-700">ลองจิจูด</p>
                                        <p className="text-blue-600 font-mono">{formData.longitude.toFixed(6)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                    บันทึกการแก้ไข
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/user/bookings")}
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
                </div>

                {/* Footer Info */}
                <div className="text-center mt-8 text-gray-600">
                    <p className="text-sm">แก้ไขข้อมูลการจองได้อย่างสะดวกและปลอดภัย</p>
                    <p className="text-xs mt-1">หากมีข้อสงสัย กรุณาติดต่อเจ้าหน้าที่</p>
                </div>
            </div>
        </div>
    );
}
