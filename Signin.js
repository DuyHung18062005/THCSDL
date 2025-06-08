import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/Signin.css";

const Signin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validateForm()) return;

    setIsLoading(true);
    console.log("Bắt đầu gửi yêu cầu đăng nhập...");

    try {
      console.log("Gọi API đăng nhập...");
      const response = await api.post("/api/auth/signin", {
        email: formData.email,
        password: formData.password,
      });
      
      console.log("Response từ server:", response);
      
      if (response.data && response.data.token) {
        console.log("Token nhận được:", response.data.token);
        localStorage.setItem("token", response.data.token);
        
        // Kiểm tra role và chuyển hướng
        const role = response.data.user?.role || "USER";
        console.log("Role người dùng:", role);
        
        if (role === "ADMIN") {
          navigate("/manager/quanlysan");
        } else {
          navigate("/");
        }
      } else {
        throw new Error("Không nhận được token từ server");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập chi tiết:", {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      
      let errorMsg = "Đăng nhập thất bại";
      if (err.response) {
        // Lỗi từ phía server
        if (err.response.status === 401) {
          errorMsg = "Email hoặc mật khẩu không đúng";
        } else if (err.response.data?.message) {
          errorMsg = err.response.data.message;
        }
      } else if (err.request) {
        // Không nhận được phản hồi
        errorMsg = "Không kết nối được với server";
      }
      
      setServerError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <h1 className="signin-title">Đăng nhập</h1>

        {serverError && (
          <div className="error-message server-error">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
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
              autoComplete="current-password"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="signin-buttons">
            <button 
              type="submit" 
              className="btn-login"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
            <Link to="/signup" className="btn-signup">
              Chưa có tài khoản? Đăng ký
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signin;