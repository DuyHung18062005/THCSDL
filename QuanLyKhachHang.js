import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/QuanLyKhachHang.css";

const QuanLyKhachHang = () => {
  const [khachHangList, setKhachHangList] = useState([]);
  const [errors, setErrors] = useState({});

  // Tạo instance axios với baseURL
  const api = axios.create({
    baseURL: "http://localhost:2006",
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/admin/users");
        setKhachHangList(
          response.data.map((item) => ({
            id: item.id,
            hoTen: item.hoTen || "Chưa có",
            soDienThoai: item.soDienThoai || "Chưa có",
            email: item.email || "Chưa có",
            matKhau: item.matKhau || "Chưa có",
            vaiTro: item.vaiTro || "USER",
          }))
        );
      } catch (error) {
        console.error("Lỗi tải danh sách khách hàng:", error.response?.data || error.message);
        setErrors({ submit: "Không thể tải danh sách. Vui lòng thử lại." });
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container">
      <div className="title">Quản lý khách hàng</div>

      {errors.submit && <div className="error-message">{errors.submit}</div>}

      <table>
        <thead>
          <tr>
            <th>Tên khách hàng</th>
            <th>Số điện thoại</th>
            <th>Mail</th>
          </tr>
        </thead>
        <tbody>
          {khachHangList.map((kh) => (
            <tr key={kh.id}>
              <td>{kh.hoTen}</td>
              <td>{kh.soDienThoai}</td>
              <td>{kh.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuanLyKhachHang;