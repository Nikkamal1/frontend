// LineConnection.jsx
import React, { useState, useEffect } from 'react';
import { FiMessageCircle, FiCheck, FiX, FiSend } from 'react-icons/fi';
import Swal from 'sweetalert2';

const LineConnection = ({ userId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [testMessage, setTestMessage] = useState('');

  // ตรวจสอบสถานะการเชื่อมต่อ
  useEffect(() => {
    if (userId) {
      checkConnectionStatus();
    }
  }, [userId]);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/line/status/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(data.connected);
        setProfile(data.profile);
      }
    } catch (error) {
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    
    try {
      // ดึง LINE Login URL
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/line/login-url/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        // เปิดหน้าต่างใหม่สำหรับ LINE Login
        const popup = window.open(
          data.loginUrl,
          'lineLogin',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        // ตรวจสอบการปิดหน้าต่าง
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setIsLoading(false);
            // ตรวจสอบสถานะใหม่
            setTimeout(checkConnectionStatus, 1000);
          }
        }, 1000);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อ LINE ได้',
        confirmButtonText: 'ตกลง'
      });
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    const result = await Swal.fire({
      title: 'ยกเลิกการเชื่อมต่อ LINE',
      text: 'คุณต้องการยกเลิกการเชื่อมต่อ LINE หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ยกเลิกการเชื่อมต่อ',
      cancelButtonText: 'ไม่'
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/line/disconnect/${userId}`, {
          method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
          setIsConnected(false);
          setProfile(null);
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: 'ยกเลิกการเชื่อมต่อ LINE แล้ว',
            confirmButtonText: 'ตกลง'
          });
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถยกเลิกการเชื่อมต่อ LINE ได้',
          confirmButtonText: 'ตกลง'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendTestMessage = async () => {
    if (!testMessage.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาใส่ข้อความ',
        text: 'กรุณาใส่ข้อความที่ต้องการส่ง',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/line/test-message/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: testMessage })
      });
      const data = await response.json();
      
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'ส่งข้อความสำเร็จ',
          text: 'ข้อความถูกส่งไปยัง LINE ของคุณแล้ว',
          confirmButtonText: 'ตกลง'
        });
        setTestMessage('');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถส่งข้อความได้',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <FiMessageCircle className="text-green-500 text-2xl" />
        <h3 className="text-lg font-semibold text-gray-800">การแจ้งเตือนผ่าน LINE</h3>
      </div>

      {isConnected ? (
        <div className="space-y-4">
          {/* สถานะการเชื่อมต่อ */}
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <FiCheck className="text-green-500 text-xl" />
            <div>
              <p className="text-green-800 font-medium">เชื่อมต่อ LINE แล้ว</p>
              {profile && (
                <div className="flex items-center gap-2 mt-1">
                  {profile.pictureUrl && (
                    <img 
                      src={profile.pictureUrl} 
                      alt="LINE Profile" 
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-green-700 text-sm">{profile.displayName}</span>
                </div>
              )}
            </div>
          </div>

          {/* ส่งข้อความทดสอบ */}
          {/* <div className="space-y-3">
            <h4 className="font-medium text-gray-700">ส่งข้อความทดสอบ</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="ใส่ข้อความที่ต้องการส่ง..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendTestMessage}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                <FiSend className="text-sm" />
                ส่ง
              </button>
            </div>
          </div> */}

          {/* ปุ่มยกเลิกการเชื่อมต่อ */}
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FiX className="text-sm" />
            ยกเลิกการเชื่อมต่อ LINE
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* คำอธิบาย */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              เชื่อมต่อ LINE เพื่อรับการแจ้งเตือนเมื่อสถานะการจองของคุณเปลี่ยนแปลง
            </p>
          </div>

          {/* ปุ่มเชื่อมต่อ */}
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
          >
            <FiMessageCircle className="text-lg" />
            {isLoading ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อ LINE'}
          </button>
        </div>
      )}

      {/* ข้อมูลเพิ่มเติม */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-xs">
          💡 การแจ้งเตือนจะส่งไปยัง LINE ของคุณเมื่อ:
        </p>
        <ul className="text-gray-600 text-xs mt-1 ml-4 list-disc">
          <li>การจองได้รับการอนุมัติ</li>
          <li>การจองถูกปฏิเสธ</li>
          <li>การจองถูกยกเลิก</li>
        </ul>
      </div>
    </div>
  );
};

export default LineConnection;
