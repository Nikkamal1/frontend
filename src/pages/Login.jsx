import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await login(email, password);

      // ✅ ตรวจสอบว่ามีข้อมูล user จาก API หรือไม่
      const user = res?.data?.user || res?.data;
      if (!user) {
        setMessage("❌ ไม่พบข้อมูลผู้ใช้จากระบบ");
        return;
      }

      console.log("Login response:", res.data);

      // ✅ ล้างข้อมูลเก่าก่อน
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");

      // ✅ เก็บข้อมูลผู้ใช้ตาม rememberMe
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      setMessage(`✅ เข้าสู่ระบบสำเร็จ! Role: ${user.role}`);

      // ✅ Redirect ตาม role โดยใช้ navigate
      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "staff":
          navigate("/staff/dashboard", { replace: true });
          break;
        case "user":
        default:
          navigate("/user/dashboard", { replace: true });
          break;
      }

    } catch (err) {
      console.error("Login error:", err);
      setMessage(err.response?.data?.message || "❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="grid md:grid-cols-2 items-center gap-6 max-w-6xl w-full shadow-lg rounded-lg bg-white p-6">

        {/* ฟอร์มล็อกอิน */}
        <div className="w-full md:max-w-md">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">เข้าสู่ระบบ</h1>
          <p className="text-sm text-slate-600 mb-6">
            ยังไม่มีบัญชี?{" "}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              สมัครสมาชิก
            </Link>
          </p>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-slate-900 mb-1">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="กรอกอีเมล"
                className="w-full border-b border-slate-300 py-2 pl-2 pr-2 text-sm outline-none focus:border-blue-600"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-slate-900 mb-1">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="กรอกรหัสผ่าน"
                className="w-full border-b border-slate-300 py-2 pl-2 pr-2 text-sm outline-none focus:border-blue-600"
              />
            </div>

            {/* Remember Me + Forgot */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 text-sm text-slate-900">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-slate-300 rounded-sm"
                />
                จำฉันไว้
              </label>
              <Link to="#" className="text-blue-600 text-sm hover:underline">
                ลืมรหัสผ่าน?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 text-sm font-medium rounded-md text-white ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>

            {/* Message */}
            {message && (
              <p className={`mt-4 text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
                {message}
              </p>
            )}
          </form>
        </div>

        {/* ภาพด้านขวา */}
        <div className="hidden md:flex items-center justify-center bg-[#000842] rounded-lg p-6">
          <img
            src="https://readymadeui.com/signin-image.webp"
            alt="login"
            className="w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
