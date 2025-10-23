import React, { useState, useEffect } from "react";
import Input from "../components/Input.jsx";
import { register, verifyOTP } from "../services/api.js";

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
    if (!name || !email || !password) {
      setMessage("⚠️ กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    setLoading(true);
    try {
      const res = await register(name, email, password);
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
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">ลงทะเบียน</h2>

      {step === 1 && (
        <>
          <Input label="ชื่อ" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="อีเมล์" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="รหัสผ่าน" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <button
            onClick={handleSendOTP}
            disabled={loading}
            className={`w-full mt-4 py-2 rounded text-white ${
              loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "กำลังส่ง OTP..." : "ส่งรหัส OTP"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <p className="mb-2 text-sm text-gray-700">
            🔐 กรุณากรอกรหัส OTP ที่ส่งไปยัง <span className="font-medium">{email}</span>
          </p>

          <Input label="รหัส OTP" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />

          <button
            onClick={handleVerifyOTP}
            disabled={loading}
            className={`w-full mt-4 py-2 rounded text-white ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
          </button>

          <button
            onClick={handleResendOTP}
            disabled={countdown > 0 || loading}
            className={`w-full mt-3 py-2 rounded border ${
              countdown > 0
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-white text-blue-600 border-blue-500 hover:bg-blue-50"
            }`}
          >
            {countdown > 0 ? `ขอรหัสใหม่ได้ใน ${countdown} วิ` : "ขอรหัส OTP ใหม่"}
          </button>
        </>
      )}

      {message && (
        <p
          className={`mt-4 text-sm text-center ${
            message.startsWith("✅") || message.startsWith("📩")
              ? "text-green-600"
              : message.startsWith("⚠️")
              ? "text-yellow-600"
              : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
