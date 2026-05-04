import React, { useEffect, useState } from "react";
import { getUserAppointments } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function UserAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [userId, setUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const userData =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));
    if (!userData || !userData.id) {
      navigate("/login", { replace: true });
      return;
    }
    setUserId(userData.id);
  }, [navigate]);

  useEffect(() => {
    if (userId) fetchAppointments();
  }, [userId]);

  const fetchAppointments = async () => {
    try {
      const res = await getUserAppointments(userId);
      setAppointments(res.data);
    } catch (err) {}
  };

  const handleView = (appointment) => setSelectedAppointment(appointment);

  const handleEdit = (appointment) => {
    if (appointment.status !== "รอการอนุมัติ") {
      alert("❌ ไม่สามารถแก้ไขได้ เนื่องจากสถานะไม่ใช่ 'รอการอนุมัติ'");
      return;
    }
    navigate(`/user/bookings/edit/${appointment.id}`);
  };

  const closeModal = () => setSelectedAppointment(null);

  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = appointments.slice(startIndex, endIndex);

  const handlePageChange = (page) => setCurrentPage(page);

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStaticMapUrl = (appointment) => {
    if (appointment.latitude && appointment.longitude) {
      const lat = appointment.latitude;
      const lng = appointment.longitude;
      return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=600x300&markers=${lat},${lng},red-pushpin`;
    }
    return null;
  };

  if (!userId)
    return (
      <p className="text-center text-gray-500 mt-6">กำลังโหลดข้อมูลผู้ใช้...</p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">รายการการจองของฉัน</h1>
          <p className="text-lg text-gray-600">จัดการการจองรถรับ-ส่งของคุณ</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีการจอง</h3>
              <p className="text-gray-500 mb-6">คุณยังไม่มีการจองรถรับ-ส่ง</p>
              <button
                onClick={() => navigate("/user/appointment")}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold"
              >
                จองคิวใหม่
              </button>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">ชื่อ-นามสกุล</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">โรงพยาบาล</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">วันที่</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">เวลา</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 border-b-2 border-gray-200">สถานะ</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 border-b-2 border-gray-200 w-48">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentAppointments.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            {a.first_name} {a.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {a.hospital}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDateTime(a.appointment_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {a.appointment_time}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              a.status === "รอการอนุมัติ"
                                ? "bg-yellow-100 text-yellow-800"
                                : a.status === "อนุมัติแล้ว"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleView(a)}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              ดู
                            </button>
                            <button
                              onClick={() => handleEdit(a)}
                              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                                a.status === "รอการอนุมัติ"
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                              disabled={a.status !== "รอการอนุมัติ"}
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

              <div className="lg:hidden space-y-4">
                {currentAppointments.map((a) => (
                  <div key={a.id} className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-gray-200 shadow-md">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{a.first_name} {a.last_name}</h3>
                        <p className="text-sm text-gray-600">{a.hospital}</p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          a.status === "รอการอนุมัติ"
                            ? "bg-yellow-100 text-yellow-800"
                            : a.status === "อนุมัติแล้ว"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(a)}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                      >
                        ดูรายละเอียด
                      </button>
                      <button
                        onClick={() => handleEdit(a)}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                          a.status === "รอการอนุมัติ"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={a.status !== "รอการอนุมัติ"}
                      >
                        แก้ไข
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">จัดการการจองของคุณได้อย่างสะดวกและปลอดภัย</p>
          <p className="text-xs mt-1">หากมีข้อสงสัย กรุณาติดต่อเจ้าหน้าที่</p>
        </div>
      </div>

      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">รายละเอียดการจอง</h3>
                  <p className="text-blue-100 text-sm">ข้อมูลการจองรถรับ-ส่ง</p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6 text-center">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    selectedAppointment.status === "รอการอนุมัติ"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedAppointment.status === "อนุมัติแล้ว"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedAppointment.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">ข้อมูลส่วนตัว</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-gray-700 w-20 inline-block">ชื่อ:</span> {selectedAppointment.first_name} {selectedAppointment.last_name}</p>
                    <p><span className="font-medium text-gray-700 w-20 inline-block">โทร:</span> {selectedAppointment.phone}</p>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-semibold text-green-800 mb-3">ที่อยู่</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-gray-700 w-16 inline-block">จังหวัด:</span> {selectedAppointment.province}</p>
                    <p><span className="font-medium text-gray-700 w-16 inline-block">อำเภอ:</span> {selectedAppointment.district}</p>
                    <p><span className="font-medium text-gray-700 w-16 inline-block">ตำบล:</span> {selectedAppointment.subdistrict}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-purple-800 mb-3">ข้อมูลการนัดหมาย</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">โรงพยาบาล</p>
                    <p className="text-gray-900">{selectedAppointment.hospital}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">วันที่</p>
                    <p className="text-gray-900">{formatDateTime(selectedAppointment.appointment_date)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">เวลา</p>
                    <p className="text-gray-900">{selectedAppointment.appointment_time}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">แผนที่ตำแหน่ง</h4>
                {selectedAppointment.latitude && selectedAppointment.longitude ? (
                  <div>
                    <div className="rounded-lg overflow-hidden shadow-md mb-2">
                      <img
                        src={getStaticMapUrl(selectedAppointment)}
                        alt="แผนที่ตำแหน่ง"
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          document.getElementById("map-fallback").style.display = "flex";
                        }}
                      />
                      <div
                        id="map-fallback"
                        style={{ display: "none" }}
                        className="w-full h-64 bg-gray-200 items-center justify-center text-gray-500 text-sm"
                      >
                        ไม่สามารถโหลดแผนที่ได้
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <a
                        href={"https://www.openstreetmap.org/?mlat=" + selectedAppointment.latitude + "&mlon=" + selectedAppointment.longitude + "&zoom=15"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:underline"
                      >
                        เปิดใน OpenStreetMap
                      </a>
                      <a
                        href={"https://www.google.com/maps?q=" + selectedAppointment.latitude + "," + selectedAppointment.longitude}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-green-600 hover:underline"
                      >
                        เปิดใน Google Maps
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                    ไม่มีข้อมูลพิกัด
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                ปิด
              </button>
            </div>

          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg font-semibold ${
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
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      <div className="text-center mt-8 text-gray-600">
        <p className="text-sm">ดูรายการจองของคุณได้อย่างสะดวกและปลอดภัย</p>
        <p className="text-xs mt-1">ข้อมูลจะได้รับการอัปเดตทันที</p>
      </div>
    </div>
  );
}