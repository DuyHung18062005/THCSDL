// src/components/pages/Home.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import jwtDecode from "jwt-decode";
import "../../styles/Home.css";

const Home = () => {
  const [searchName, setSearchName] = useState("");
  const [searchArea, setSearchArea] = useState("");
  const [fields, setFields] = useState([]);
  const [filteredFields, setFilteredFields] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [userId, setUserId] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);

  // Lấy token từ localStorage
  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: "http://localhost:2006",   // gọi thẳng tới root của BE
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // 1) Fetch danh sách sân
  useEffect(() => {
    api
      .get("/api/admin/san")
      .then(res => {
        setFields(res.data);
        setFilteredFields(res.data);
        setBranches([...new Set(res.data.map(f => f.tenChiNhanh))]);
      })
      .catch(err => console.error("Lỗi fetch sân:", err.response?.data || err.message));
  }, []);

  // 2) Decode token để lấy email, rồi fetch all users để tìm userId của mình
  useEffect(() => {
    if (!token) return;
    let email;
    try {
      email = jwtDecode(token).sub;
    } catch (e) {
      console.error("JWT decode error:", e);
      return;
    }
    api
      .get("/api/admin/users")
      .then(res => {
        const me = res.data.find(u => u.email === email);
        if (me) setUserId(me.id);
      })
      .catch(err => console.error("Lỗi lấy users:", err.response?.data || err.message));
  }, [token]);

  // 3) Khi chọn sân, fetch khung giờ từ BE
  useEffect(() => {
    if (!selectedField) return;
    api
      .get(`/user/${selectedField.id}`)
      .then(res => setTimeSlots(res.data.khungGioCoDinhs || []))
      .catch(err => console.error("Lỗi lấy khung giờ:", err.response?.data || err.message));
  }, [selectedField]);

  // 4) Lọc sân theo tên và chi nhánh
  const filterSan = () => {
    let tmp = fields;
    if (searchName) {
      tmp = tmp.filter(f => f.tenSan.toLowerCase().includes(searchName.toLowerCase()));
    }
    if (searchArea) {
      tmp = tmp.filter(f => f.tenChiNhanh === searchArea);
    }
    setFilteredFields(tmp);
  };

  // 5) Mở/đóng overlay chi tiết sân
  const showFieldDetails = san => {
    setSelectedField(san);
    setShowOverlay(true);
  };
  const closeOverlay = () => {
    setShowOverlay(false);
    setTimeSlots([]);
  };

  // 6) Gọi API đặt sân đúng đường dẫn BE cung cấp: POST /user/datSan
  const bookField = async (date, khungGioCoDinhId) => {
    if (!selectedField || !userId || !khungGioCoDinhId) {
      alert("Không xác định được user, sân hoặc khung giờ");
      return;
    }
    try {
      await api.post("/user/datSan", {
        sanId: selectedField.id,
        userId,
        khungGioCoDinhId,
        ngay: date
      });
      alert("Đặt sân thành công!");
      closeOverlay();
    } catch (err) {
      console.error("Lỗi đặt sân:", err.response?.data || err.message);
      alert(`Đặt sân thất bại: ${err.response?.data || err.message}`);
    }
  };

  // 7) Hiển thị lưới khung giờ 5 ngày
  const generateTimeSlots = () => {
    if (!selectedField || timeSlots.length === 0) {
      return <p>Không có khung giờ khả dụng.</p>;
    }
    const days = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }

    return (
      <div className="thoikhoabieu">
        {days.map((day, idx) => (
          <div key={idx} className="ngay">
            <h4>
              {day.toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "numeric",
              })}
            </h4>
            {timeSlots.map(slot => {
              const booked = slot.daDat || slot.trangThai === "DA_DAT";
              const dateStr = day.toISOString().slice(0, 10);
              return (
                <div key={slot.id} className={`khunggio ${booked ? "dat" : ""}`}>
                  {slot.khungGio}
                  {!booked && (
                    <button
                      className="btn-book"
                      onClick={() => bookField(dateStr, slot.id)}
                    >
                      Đặt sân
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="welcome">
        <div className="welcome-left">
          <h1 className="chaomung xx">Chào mừng đến với sân bóng của chúng tôi!</h1>
          <p className="chaomung ss">
            Sân bóng D2HT là địa điểm lý tưởng dành cho những người đam mê bóng đá...
          </p>
        </div>
        <div className="welcome-right"></div>
      </div>

      <h2 className="danhsachsanbong"><p className="dssb">Danh sách sân bóng</p></h2>

      <div className="listsearch">
        <div className="searchfield">
          <h2>Tìm kiếm sân:</h2>
          <label htmlFor="searchName">Tên sân:</label>
          <input
            id="searchName"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
          <label htmlFor="searchArea">Chi nhánh:</label>
          <select
            id="searchArea"
            value={searchArea}
            onChange={e => setSearchArea(e.target.value)}
          >
            <option value="">Tất cả chi nhánh</option>
            {branches.map((b,i) => <option key={i} value={b}>{b}</option>)}
          </select>
          <button onClick={filterSan}>Tìm kiếm</button>
        </div>

        <div className="sanbong-container">
          {filteredFields.length === 0
            ? <p>Không tìm thấy sân phù hợp.</p>
            : filteredFields.map((san,idx) => (
              <div key={idx} className="san-item">
                <h3>{san.tenSan}</h3>
                <p><strong>Chi nhánh:</strong> {san.tenChiNhanh}</p>
                <p><strong>Loại sân:</strong> {san.loaiSan}</p>
                <p><strong>Giá thuê:</strong> {san.giaSan.toLocaleString("vi-VN")} VND</p>
                <button className="btn-datsan" onClick={() => showFieldDetails(san)}>
                  Xem chi tiết sân
                </button>
              </div>
            ))
          }
        </div>
      </div>

      {showOverlay && selectedField && (
        <div className="overlay">
          <div className="overlay-content">
            <span className="close-btn" onClick={closeOverlay}>&times;</span>
            <h2>{selectedField.tenSan}</h2>
            <div className="san-info">
              <p><strong>Chi nhánh:</strong> {selectedField.tenChiNhanh}</p>
              <p><strong>Loại sân:</strong> {selectedField.loaiSan}</p>
              <p><strong>Giá thuê:</strong> {selectedField.giaSan.toLocaleString("vi-VN")} VND</p>
            </div>
            <h3>Lịch đặt sân</h3>
            {generateTimeSlots()}
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
