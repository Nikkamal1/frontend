// LineCallback.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const LineCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handleCallback = async () => {
      // ตรวจสอบ URL parameters จาก backend redirect
      const success = searchParams.get('success');
      const message = searchParams.get('message');
      

      if (success === 'true') {
        // LINE connection สำเร็จ
        setStatus('success');
        
        // แจ้งให้หน้าหลักทราบว่าการเชื่อมต่อสำเร็จ
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'LINE_CONNECTED', 
            success: true, 
            message: decodeURIComponent(message || 'เชื่อมต่อ LINE สำเร็จ')
          }, '*');
        }
      } else if (success === 'false') {
        // LINE connection ไม่สำเร็จ
        setStatus('error');
        console.error('❌ LINE connection failed:', message);
        
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'LINE_CONNECTED', 
            success: false, 
            error: decodeURIComponent(message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ')
          }, '*');
        }
      } else {
        // ตรวจสอบ LINE Login parameters (สำหรับกรณีที่ยังใช้วิธีเก่า)
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          console.error('LINE Login error:', error);
          setStatus('error');
          if (window.opener) {
            window.opener.postMessage({ type: 'LINE_CONNECTED', success: false, error: 'LINE Login error' }, '*');
          }
        } else if (!code || !state) {
          console.error('Missing code or state');
          setStatus('error');
          if (window.opener) {
            window.opener.postMessage({ type: 'LINE_CONNECTED', success: false, error: 'Missing parameters' }, '*');
          }
        } else {
          // ใช้วิธีเก่า (POST to callback)
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/line/callback`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ code, state })
            });

            const data = await response.json();

            if (data.success) {
              setStatus('success');
              if (window.opener) {
                window.opener.postMessage({ type: 'LINE_CONNECTED', success: true }, '*');
              }
            } else {
              setStatus('error');
              if (window.opener) {
                window.opener.postMessage({ type: 'LINE_CONNECTED', success: false, error: data.message }, '*');
              }
            }
          } catch (error) {
            console.error('Error processing LINE callback:', error);
            setStatus('error');
            if (window.opener) {
              window.opener.postMessage({ type: 'LINE_CONNECTED', success: false, error: 'เกิดข้อผิดพลาด' }, '*');
            }
          }
        }
      }

      // ปิดหน้าต่างหลังจาก 3 วินาที
      setTimeout(() => {
        window.close();
      }, 3000);
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">กำลังเชื่อมต่อ LINE</h2>
              <p className="text-gray-600">กรุณารอสักครู่...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">เชื่อมต่อ LINE สำเร็จ</h2>
              <p className="text-gray-600">คุณจะได้รับแจ้งเตือนผ่าน LINE เมื่อสถานะการจองเปลี่ยนแปลง</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-red-500 text-6xl mb-4">✗</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">เชื่อมต่อ LINE ไม่สำเร็จ</h2>
              <p className="text-gray-600">เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง</p>
            </>
          )}

          <div className="mt-6">
            <p className="text-sm text-gray-500">หน้าต่างนี้จะปิดอัตโนมัติใน 3 วินาที</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineCallback;
