// src/components/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/Signin.css";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    password: "",
    soDienThoai: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.hoTen.trim()) newErrors.hoTen = "Vui lòng nhập họ tên";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]{2,}$/.test(formData.email))
      newErrors.email = "Email không hợp lệ";
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (formData.password.length < 6)
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    if (!formData.soDienThoai) newErrors.soDienThoai = "Vui lòng nhập số điện thoại";
    else if (!/^\d{10}$/.test(formData.soDienThoai))
      newErrors.soDienThoai = "Số điện thoại phải là 10 chữ số";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post("/api/auth/signup", formData);

      // Backend trả về một string thông báo
      if (typeof res.data === "string") {
        alert(res.data);
        navigate("/signin");
      } else {
        throw new Error("Phản hồi từ server không hợp lệ");
      }
    } catch (err) {
      console.error("Đăng ký lỗi:", err);
      let errorMsg = "Đăng ký thất bại. Vui lòng thử lại.";

      if (err.response) {
        // Nếu server trả về lỗi
        const data = err.response.data;
        if (typeof data === "string") {
          errorMsg = data;
        } else if (data.message || data.error) {
          errorMsg = data.message || data.error;
        } else {
          errorMsg = JSON.stringify(data);
        }
      } else if (err.request) {
        errorMsg = "Không kết nối được với server. Vui lòng kiểm tra kết nối.";
      }

      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <h1 className="signin-title">Đăng ký</h1>

        {serverError && (
          <div className="error-message server-error">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            <label htmlFor="hoTen">Họ và tên:</label>
            <input
              type="text"
              id="hoTen"
              className={`signin-input ${errors.hoTen ? "input-error" : ""}`}
              placeholder="Nhập họ và tên"
              value={formData.hoTen}
              onChange={handleChange}
            />
            {errors.hoTen && <div className="error-message">{errors.hoTen}</div>}
          </div>

          <div className="field-row">
            <label htmlFor="email">Địa chỉ email:</label>
            <input
              type="email"
              id="email"
              className={`signin-input ${errors.email ? "input-error" : ""}`}
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="field-row">
            <label htmlFor="password">Mật khẩu:</label>
            <input
              type="password"
              id="password"
              className={`signin-input ${errors.password ? "input-error" : ""}`}
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="field-row">
            <label htmlFor="soDienThoai">Số điện thoại:</label>
            <input
              type="tel"
              id="soDienThoai"
              className={`signin-input ${errors.soDienThoai ? "input-error" : ""}`}
              placeholder="Nhập số điện thoại"
              value={formData.soDienThoai}
              onChange={handleChange}
              maxLength="10"
            />
            {errors.soDienThoai && <div className="error-message">{errors.soDienThoai}</div>}
          </div>

          <div className="signin-buttons">
            <button 
              type="submit" 
              className="btn-login"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </button>
            <Link to="/signin" className="btn-signup">
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
