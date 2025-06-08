import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/QuanLySan.css";

// Tạo instance axios với baseURL
const api = axios.create({
  baseURL: "http://localhost:2006",
});

const QuanLySan = () => {
  const [chiNhanhList, setChiNhanhList] = useState([]);
  const [sanList, setSanList] = useState([]);
  const [datSanList, setDatSanList] = useState([]);
  const [error, setError] = useState(null);

  const [showChiNhanhForm, setShowChiNhanhForm] = useState(false);
  const [chiNhanhFormData, setChiNhanhFormData] = useState({
    tenChiNhanh: "",
    diaChi: "",
  });

  const [showSanForm, setShowSanForm] = useState(false);
  const [sanFormData, setSanFormData] = useState({
    tenSan: "",
    loaiSan: "",
    giaThue: "",
    chiNhanhId: "",
  });

  // Fetch data khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cnRes, sanRes, datRes] = await Promise.all([
          api.get("/api/admin/chinhanh"),
          api.get("/api/admin/san"),
          api.get("/api/admin/quanlydat"),
        ]);

        // Xử lý dữ liệu theo cấu trúc API
        setChiNhanhList(
          cnRes.data.map((item) => ({
            id: item.id,
            tenChiNhanh: item.tenChiNhanh,
            diaChi: item.diaChi || "Chưa có địa chỉ",
          }))
        );
        setSanList(
          sanRes.data.map((item) => ({
            id: item.id || item.maSan,
            tenSan: item.tenSan,
            loaiSan: item.loaiSan,
            giaThue: item.giaSan,
            chiNhanhId: chiNhanhList.find((cn) => cn.tenChiNhanh === item.tenChiNhanh)?.id || null,
          }))
        );
        setDatSanList(
          datRes.data.map((item) => ({
            id: item.idDatSan,
            tenKhachHang: item.tenKhachHang || "Chưa có",
            tenSan: item.tenSan,
            thoiGian: item.ngayDat || "Chưa có",
            trangThai: item.trangThaiThanhToan || "Chưa có",
          }))
        );
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err.response?.data || err.message);
        setError(
          `Lỗi: ${err.response?.status} - ${err.response?.data?.message || err.message}`
        );
      }
    };
    fetchData();
  }, []);

  // Handler của form chi nhánh
  const toggleChiNhanhForm = () => setShowChiNhanhForm((v) => !v);
  const handleChiNhanhChange = (e) =>
    setChiNhanhFormData((d) => ({ ...d, [e.target.id]: e.target.value }));

  const themChiNhanh = async () => {
    const { tenChiNhanh, diaChi } = chiNhanhFormData;
    if (!tenChiNhanh || !diaChi) {
      alert("Vui lòng nhập đầy đủ tên chi nhánh và địa chỉ!");
      return;
    }
    try {
      const res = await api.post("/api/admin/themchinhanh", { tenChiNhanh, diaChi });
      setChiNhanhList((xs) => [...xs, { id: res.data.id, tenChiNhanh, diaChi }]);
      setChiNhanhFormData({ tenChiNhanh: "", diaChi: "" });
      setShowChiNhanhForm(false);
    } catch (err) {
      console.error("Lỗi thêm chi nhánh:", err.response?.data || err.message);
      alert("Thêm chi nhánh thất bại.");
    }
  };

  // Handler của form sân
  const toggleSanForm = () => setShowSanForm((v) => !v);
  const handleSanChange = (e) =>
    setSanFormData((d) => ({ ...d, [e.target.id]: e.target.value }));

  const themSan = async () => {
    const { tenSan, loaiSan, giaThue, chiNhanhId } = sanFormData;
    if (!tenSan || !loaiSan || !giaThue || !chiNhanhId) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    try {
      const body = {
        tenSan,
        loaiSan,
        giaSan: Number(giaThue),
        chiNhanhId: Number(chiNhanhId),
      };
      const res = await api.post("/api/admin/san", body);
      setSanList((xs) => [...xs, { ...res.data, giaThue: Number(giaThue) }]);
      setSanFormData({ tenSan: "", loaiSan: "", giaThue: "", chiNhanhId: "" });
      setShowSanForm(false);
    } catch (err) {
      console.error("Lỗi thêm sân:", err.response?.data || err.message);
      alert("Thêm sân thất bại.");
    }
  };

  const xoaSan = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sân này?")) {
      try {
        console.log(`Gửi request DELETE đến /api/admin/san/${id}`); // Debug
        const response = await api.delete(`/api/admin/san/${id}`); // Thay bằng /api/admin/san
        console.log("Response từ server:", response.data); // Debug
        setSanList((xs) => xs.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Lỗi xóa sân:", err.response?.data || err.message);
        alert(`Xóa sân thất bại: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const suaSan = async (id) => {
    const san = sanList.find((item) => item.id === id);
    const tenMoi = prompt("Sửa tên sân:", san.tenSan);
    const loaiMoi = prompt("Sửa loại sân:", san.loaiSan);
    const giaMoi = prompt("Sửa giá thuê:", san.giaThue);
    if (tenMoi && loaiMoi && giaMoi) {
      try {
        console.log(`Gửi request PUT đến /api/admin/san/${id}`, { tenSan: tenMoi, loaiSan: loaiMoi, giaSan: Number(giaMoi) }); // Debug
        const response = await api.put(`/api/admin/san/${id}`, {
          tenSan: tenMoi,
          loaiSan: loaiMoi,
          giaSan: Number(giaMoi),
        });
        console.log("Response từ server:", response.data); // Debug
        setSanList((xs) =>
          xs.map((item) =>
            item.id === id
              ? { ...item, tenSan: tenMoi, loaiSan: loaiMoi, giaThue: Number(giaMoi) }
              : item
          )
        );
      } catch (err) {
        console.error("Lỗi sửa sân:", err.response?.data || err.message);
        alert(`Sửa sân thất bại: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // Handler của form đặt sân (placeholder)
  const xoaDatSan = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa đặt sân này?")) {
      try {
        await api.delete(`/api/admin/quanlydat/${id}`); // Placeholder, kiểm tra endpoint thực tế
        setDatSanList((xs) => xs.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Lỗi xóa đặt sân:", err.response?.data || err.message);
        alert("Xóa đặt sân thất bại.");
      }
    }
  };

  const suaDatSan = async (id) => {
    const datSan = datSanList.find((item) => item.id === id);
    const tenKhachHangMoi = prompt("Sửa tên khách hàng:", datSan.tenKhachHang);
    const thoiGianMoi = prompt("Sửa thời gian:", datSan.thoiGian);
    if (tenKhachHangMoi && thoiGianMoi) {
      try {
        await api.put(`/api/admin/quanlydat/${id}`, {
          tenKhachHang: tenKhachHangMoi,
          thoiGian: thoiGianMoi,
        });
        setDatSanList((xs) =>
          xs.map((item) =>
            item.id === id
              ? { ...item, tenKhachHang: tenKhachHangMoi, thoiGian: thoiGianMoi }
              : item
          )
        );
      } catch (err) {
        console.error("Lỗi sửa đặt sân:", err.response?.data || err.message);
        alert("Sửa đặt sân thất bại.");
      }
    }
  };

  return (
    <div className="container">
      {/* ==== Quản lý chi nhánh ==== */}
      <h2>Quản lý chi nhánh</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button onClick={toggleChiNhanhForm}>+ Thêm chi nhánh</button>
      {showChiNhanhForm && (
        <div className="form-add">
          <input
            type="text"
            id="tenChiNhanh"
            placeholder="Tên chi nhánh"
            value={chiNhanhFormData.tenChiNhanh}
            onChange={handleChiNhanhChange}
          />
          <input
            type="text"
            id="diaChi"
            placeholder="Địa chỉ"
            value={chiNhanhFormData.diaChi}
            onChange={handleChiNhanhChange}
          />
          <button onClick={themChiNhanh}>Lưu</button>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>Tên chi nhánh</th>
            <th>ID</th> {/* Thay Địa chỉ bằng ID */}
          </tr>
        </thead>
        <tbody>
          {chiNhanhList.map((cn) => (
            <tr key={cn.id}>
              <td>{cn.tenChiNhanh}</td>
              <td>{cn.id}</td> {/* Hiển thị ID thay vì diaChi */}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ==== Quản lý sân ==== */}
      <h2>Quản lý sân</h2>
      <button onClick={toggleSanForm}>+ Thêm sân</button>
      {showSanForm && (
        <div className="form-add">
          <input
            type="text"
            id="tenSan"
            placeholder="Tên sân"
            value={sanFormData.tenSan}
            onChange={handleSanChange}
          />
          <input
            type="text"
            id="loaiSan"
            placeholder="Loại sân"
            value={sanFormData.loaiSan}
            onChange={handleSanChange}
          />
          <input
            type="number"
            id="giaThue"
            placeholder="Giá thuê"
            value={sanFormData.giaThue}
            onChange={handleSanChange}
          />
          <select
            id="chiNhanhId"
            value={sanFormData.chiNhanhId}
            onChange={handleSanChange}
          >
            <option value="">Chọn chi nhánh</option>
            {chiNhanhList.map((cn) => (
              <option key={cn.id} value={cn.id}>
                {cn.tenChiNhanh}
              </option>
            ))}
          </select>
          <button onClick={themSan}>Lưu</button>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>Tên sân</th>
            <th>Loại sân</th>
            <th>Chi nhánh</th>
            <th>Giá thuê</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sanList.map((s) => (
            <tr key={s.id}>
              <td>{s.tenSan}</td>
              <td>{s.loaiSan}</td>
              <td>
                {chiNhanhList.find((cn) => cn.id === s.chiNhanhId)?.tenChiNhanh ||
                  "Chưa có"}
              </td>
              <td>{s.giaThue.toLocaleString("vi-VN")} VND</td>
              <td>
                <button className="action-btn" onClick={() => suaSan(s.id)}>
                  Sửa
                </button>
                <button className="action-btn" onClick={() => xoaSan(s.id)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ==== Quản lý đặt sân ==== */}
      <h2>Quản lý đặt sân</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên khách hàng</th>
            <th>Tên sân</th>
            <th>Thời gian</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {datSanList.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.tenKhachHang}</td>
              <td>{d.tenSan}</td>
              <td>{d.thoiGian}</td>
              <td>{d.trangThai}</td>
              <td>
                <button className="action-btn" onClick={() => suaDatSan(d.id)}>
                  Sửa
                </button>
                <button className="action-btn" onClick={() => xoaDatSan(d.id)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuanLySan;