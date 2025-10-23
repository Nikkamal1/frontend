import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">นโยบายความเป็นส่วนตัว</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. การเก็บรวบรวมข้อมูล</h2>
            <p className="text-gray-700 mb-6">
              ระบบ Shuttle System เก็บรวบรวมข้อมูลส่วนบุคคลของท่านเพื่อให้บริการจองรถรับ-ส่ง
              ข้อมูลที่เก็บรวมถึง ชื่อ-นามสกุล เบอร์โทรศัพท์ อีเมล และข้อมูลการจอง
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. การใช้ข้อมูล</h2>
            <p className="text-gray-700 mb-6">
              ข้อมูลของท่านจะถูกใช้เพื่อ:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>ให้บริการจองรถรับ-ส่ง</li>
              <li>ติดต่อแจ้งเตือนเกี่ยวกับการจอง</li>
              <li>ส่งการแจ้งเตือนผ่าน LINE (หากท่านเชื่อมต่อ)</li>
              <li>ปรับปรุงและพัฒนาระบบ</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. การเปิดเผยข้อมูล</h2>
            <p className="text-gray-700 mb-6">
              ข้อมูลของท่านจะไม่ถูกเปิดเผยให้กับบุคคลที่สาม ยกเว้นกรณีที่กฎหมายกำหนด
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. การรักษาความปลอดภัย</h2>
            <p className="text-gray-700 mb-6">
              ระบบใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของท่าน
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. สิทธิของท่าน</h2>
            <p className="text-gray-700 mb-6">
              ท่านมีสิทธิในการเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของท่าน
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. การติดต่อ</h2>
            <p className="text-gray-700 mb-6">
              หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว กรุณาติดต่อเจ้าหน้าที่
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
