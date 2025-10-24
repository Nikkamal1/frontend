import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { register, verifyOTP } from "../services/api.js";
import { validateEmail, validatePassword, validateName, escapeHTML, rateLimiter } from "../utils/security.js";

export default function Register() {
  const [step, setStep] = useState(1); // 1 = กรอกข้อมูล, 2 = OTP
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(0); // นับถอยหลัง 60 วิ
  const [loading, setLoading] = useState(false);

  // 🕒 ตัวจับเวลา OTP Countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // 📨 ขอ OTP (ส่งข้อมูลสมัครเบื้องต้น)
  const handleSendOTP = async () => {
    // 🛡️ Input validation
    if (!validateName(name)) {
      setMessage("⚠️ ชื่อต้องมี 2-50 ตัวอักษร และเป็นตัวอักษรเท่านั้น");
      return;
    }

    if (!validateEmail(email)) {
      setMessage("⚠️ กรุณากรอกอีเมลที่ถูกต้อง");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setMessage(`⚠️ ${passwordValidation.message}`);
      return;
    }

    // 🛡️ Rate limiting
    if (!rateLimiter.isAllowed('register')) {
      setMessage("❌ กำลังพยายามสมัครสมาชิกบ่อยเกินไป กรุณารอสักครู่");
      return;
    }

    setLoading(true);
    try {
      // 🛡️ Sanitize inputs
      const sanitizedData = {
        name: escapeHTML(name.trim()),
        email: escapeHTML(email.trim().toLowerCase()),
        password: password
      };
      const res = await register(sanitizedData.name, sanitizedData.email, sanitizedData.password);
      setMessage(res.data.message || "📩 ส่ง OTP สำเร็จแล้ว กรุณาตรวจอีเมลของคุณ");
      setStep(2);
      setCountdown(60); // เริ่มนับถอยหลังใหม่
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ ไม่สามารถส่ง OTP ได้");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ตรวจสอบ OTP
  const handleVerifyOTP = async () => {
    if (!otp) {
      setMessage("⚠️ กรุณากรอกรหัส OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOTP(email, otp);
      setMessage(res.data.message || "✅ ยืนยัน OTP สำเร็จ! สมัครสมาชิกเรียบร้อยแล้ว");

      // Reset form หลังสมัครเสร็จ
      setStep(1);
      setName("");
      setEmail("");
      setPassword("");
      setOtp("");
      setCountdown(0);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ รหัส OTP ไม่ถูกต้องหรือหมดอายุ");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 ขอ OTP ใหม่
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    await handleSendOTP();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">สมัครสมาชิก</h1>
          <p className="text-lg text-gray-600">สร้างบัญชีใหม่เพื่อเริ่มใช้งานระบบจองรถรับ-ส่ง</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* ฟอร์มสมัครสมาชิก */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {step === 1 ? "ข้อมูลส่วนตัว" : "ยืนยันรหัส OTP"}
              </h2>
              <p className="text-gray-600">
                {step === 1 ? (
                  <>
                    มีบัญชีแล้ว?{" "}
                    <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                      เข้าสู่ระบบ
                    </Link>
                  </>
                ) : (
                  `กรุณากรอกรหัส OTP ที่ส่งไปยัง ${email}`
                )}
              </p>
            </div>

            {step === 1 && (
              <form className="space-y-6">
                {/* ชื่อ */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ชื่อ-นามสกุล
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="กรอกชื่อ-นามสกุลของคุณ"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    อีเมล
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="กรอกอีเมลของคุณ"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="กรอกรหัสผ่านของคุณ"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Send OTP Button */}
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                    loading 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังส่ง OTP...
                    </div>
                  ) : (
                    "ส่งรหัส OTP"
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    รหัส OTP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      placeholder="กรอกรหัส OTP 6 หลัก"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 text-center text-lg tracking-widest"
                    />
                  </div>
                </div>

                {/* Verify OTP Button */}
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                    loading 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังตรวจสอบ...
                    </div>
                  ) : (
                    "ยืนยัน OTP"
                  )}
                </button>

                {/* Resend OTP Button */}
                <button
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || loading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    countdown > 0 || loading
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-white text-blue-600 border-2 border-blue-500 hover:bg-blue-50 hover:border-blue-600"
                  }`}
                >
                  {countdown > 0 ? `ขอรหัสใหม่ได้ใน ${countdown} วินาที` : "ขอรหัส OTP ใหม่"}
                </button>
              </div>
            )}

            {/* Message */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg ${
                message.startsWith("✅") || message.startsWith("📩")
                  ? "bg-green-50 border border-green-200 text-green-800" 
                  : message.startsWith("⚠️")
                  ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}>
                <div className="flex items-center gap-2">
                  {message.startsWith("✅") ? (
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : message.startsWith("📩") ? (
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ) : message.startsWith("⚠️") ? (
                    <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            )}
          </div>

          {/* ภาพด้านขวา */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">เริ่มต้นใช้งาน</h3>
                  <p className="text-green-100 text-lg leading-relaxed">
                    สมัครสมาชิกเพื่อเข้าถึงระบบจองรถรับ-ส่ง<br />
                    รับการแจ้งเตือนแบบเรียลไทม์<br />
                    และจัดการการจองได้อย่างสะดวก
                  </p>
                </div>
                
                {/* Features */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-green-100">สมัครง่าย ใช้ฟรี</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-green-100">ยืนยันตัวตนด้วย OTP</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-green-100">ปลอดภัย 100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
