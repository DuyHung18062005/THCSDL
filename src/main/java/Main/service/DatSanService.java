package Main.service;

import Main.entity.*;
import Main.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DatSanService {
    @Autowired
    private DatsanRepository datsanRepo;
    @Autowired
    private SanRepository sanRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private KhungGioCoDinhRepository kgRepo;

    // Tìm danh sách sân còn trống theo chi nhánh và ngày
    public List<San> timSanConTrong(Long chiNhanhId, LocalDate ngay) {
        List<San> danhSachSan = sanRepo.findByChiNhanhId(chiNhanhId);
        return danhSachSan.stream()
                .filter(san -> san.getKhungGioCoDinhs().stream()
                        .anyMatch(kg -> datsanRepo.findBySanAndKhungGioCoDinhAndNgay(san, kg, ngay).isEmpty()))
                .collect(Collectors.toList());
    }

    @Transactional
    public String datSan(Long sanId, Long userId, Long kgCoDinhId, LocalDate ngay) {
        // Kiểm tra tồn tại sân, user, khung giờ
        San san = sanRepo.findById(sanId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sân"));
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        KhungGioCoDinh kg = kgRepo.findById(kgCoDinhId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khung giờ"));

        // Kiểm tra slot đã được đặt chưa
        boolean daDat = datsanRepo.findBySanAndKhungGioCoDinhAndNgay(san, kg, ngay).isPresent();
        if (daDat) {
            return "Khung giờ này đã được đặt!";
        }

        // Tạo mới bản ghi đặt sân
        Datsan ds = new Datsan();
        ds.setSan(san);
        ds.setUser(user);
        ds.setKhungGioCoDinh(kg);
        ds.setNgay(ngay);
        ds.setTrangThai(TrangThai.DA_DAT);

        datsanRepo.save(ds);

        return "Đặt sân thành công! Giá sân: " + san.getGiaSan();
    }
}
