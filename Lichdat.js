import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Lichdat.css";

const Lichdat = () => {
  const [bookings, setBookings] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [errors, setErrors] = useState({});

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/admin/quanlydat", {
          baseURL: "http://localhost:2006",
        });
        // Chuyển đổi dữ liệu từ QuanLyDatSanDTO sang định dạng phù hợp
        const formattedBookings = response.data.map((item) => ({
          id: item.idDatSan,
          field: item.tenSan,
          date: item.ngayDat,
          startTime: "", // Cần thêm trường khungGio từ API nếu có
          endTime: "",   // Cần thêm trường khungGio từ API nếu có
        }));
        setBookings(formattedBookings);
      } catch (error) {
        console.error("Lỗi tải lịch đặt:", error);
        setErrors({ submit: "Không thể tải lịch đặt. Vui lòng thử lại." });
      }
    };
    fetchData();
  }, []);

  const deleteBooking = (id) => {
    if (window.confirm("Bạn có chắc muốn xoá lịch đặt này?")) {
      // TODO: Gọi API xóa nếu có (ví dụ: DELETE /api/admin/quanlydat/{id})
      setBookings(bookings.filter((booking) => booking.id !== id));
    }
  };

  const openEditForm = (booking) => {
    setCurrentBooking(booking);
    setShowEditForm(true);
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setCurrentBooking(null);
  };

  const saveEdit = () => {
    if (currentBooking) {
      // In a real app, you would send this to your backend
      setBookings(
        bookings.map((booking) =>
          booking.id === currentBooking.id ? currentBooking : booking
        )
      );

      // Generate QR code
      const qrData = `Thanh toán cho ${currentBooking.field} - ${currentBooking.date} từ ${currentBooking.startTime} đến ${currentBooking.endTime}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        qrData
      )}`;
      setQrImageUrl(qrUrl);

      // Close edit form and show QR popup
      setShowEditForm(false);
      setShowQrPopup(true);
    }
  };

  const closeQrPopup = () => {
    setShowQrPopup(false);
  };

  return (
    <div className="lichdat-container">
      <h2 className="lichdat-title">Lịch đặt sân của tôi</h2>

      {errors.submit && <div className="error-message">{errors.submit}</div>}

      <div className="lichdat-table">
        <table>
          <thead>
            <tr>
              <th>Sân</th>
              <th>Ngày</th>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.field || "Chưa có"}</td>
                <td>{booking.date || "Chưa có"}</td>
                <td>{booking.startTime || "Chưa có"}</td>
                <td>{booking.endTime || "Chưa có"}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => openEditForm(booking)}
                  >
                    Thanh toán
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => deleteBooking(booking.id)}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Form */}
      {showEditForm && (
        <div className="edit-popup">
          <h2>Thanh toán Lịch Đặt</h2>
          <label htmlFor="editField">Sân:</label>
          <input
            type="text"
            id="editField"
            value={currentBooking?.field || ""}
            onChange={(e) =>
              setCurrentBooking({ ...currentBooking, field: e.target.value })
            }
          />
          <label htmlFor="editDate">Ngày:</label>
          <input
            type="date"
            id="editDate"
            value={currentBooking?.date || ""}
            onChange={(e) =>
              setCurrentBooking({ ...currentBooking, date: e.target.value })
            }
          />
          <label htmlFor="editStartTime">Giờ Bắt Đầu:</label>
          <input
            type="time"
            id="editStartTime"
            value={currentBooking?.startTime || ""}
            onChange={(e) =>
              setCurrentBooking({
                ...currentBooking,
                startTime: e.target.value,
              })
            }
          />
          <label htmlFor="editEndTime">Giờ Kết Thúc:</label>
          <input
            type="time"
            id="editEndTime"
            value={currentBooking?.endTime || ""}
            onChange={(e) =>
              setCurrentBooking({ ...currentBooking, endTime: e.target.value })
            }
          />
          <button onClick={saveEdit}>Thanh toán</button>
          <button onClick={closeEditForm}>Hủy</button>
        </div>
      )}

      {/* QR Popup */}
      {showQrPopup && (
        <div className="qr-popup" style={{ display: "flex" }}>
          <div className="qr-content">
            <h2>Quét mã QR để thanh toán</h2>
            <img src={qrImageUrl} alt="QR Code" />
            <br />
            <button onClick={closeQrPopup}>Đóng</button>
          </div>
        </div>
      )}

      <div className="lichdat-info">
        <h2>Lưu ý:</h2>
        <ul>
          <li>Lịch đặt sân chỉ có hiệu lực sau khi được thanh toán.</li>
          <li>
            Vui lòng hủy lịch đặt trước ít nhất 2 giờ nếu không thể tham gia.
          </li>
          <li>
            Mọi thắc mắc xin liên hệ: <strong>0969272243</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Lichdat;