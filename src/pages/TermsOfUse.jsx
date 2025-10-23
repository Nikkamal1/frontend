import React from 'react';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">ข้อกำหนดการใช้งาน</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. การยอมรับข้อกำหนด</h2>
            <p className="text-gray-700 mb-6">
              การใช้งานระบบ Shuttle System ถือว่าท่านยอมรับข้อกำหนดการใช้งานนี้
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. การใช้งานระบบ</h2>
            <p className="text-gray-700 mb-6">
              ท่านต้องใช้ระบบอย่างถูกต้องและไม่ละเมิดสิทธิของผู้อื่น
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. การจองรถรับ-ส่ง</h2>
            <p className="text-gray-700 mb-6">
              การจองรถรับ-ส่งต้องทำล่วงหน้าและยืนยันการจอง
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. การยกเลิกการจอง</h2>
            <p className="text-gray-700 mb-6">
              สามารถยกเลิกการจองได้ก่อนเวลานัดหมาย
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. ความรับผิดชอบ</h2>
            <p className="text-gray-700 mb-6">
              ระบบไม่รับผิดชอบต่อความเสียหายที่เกิดจากการใช้งาน
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. การเปลี่ยนแปลงข้อกำหนด</h2>
            <p className="text-gray-700 mb-6">
              ข้อกำหนดนี้อาจมีการเปลี่ยนแปลงได้ตามความเหมาะสม
            </p>

            <p className="text-sm text-gray-500 mt-8">
              อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
