package Main.service;

import Main.dto.request.*;
import Main.entity.Chinhanh;
import Main.entity.Datsan;
import Main.entity.San;
import Main.entity.User;
import Main.repository.ChiNhanhRepository;
import Main.repository.DatsanRepository;
import Main.repository.SanRepository;
import Main.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SanRepository sanRepository;

    @Autowired
    private ChiNhanhRepository chiNhanhRepository;

    @Autowired
    private DatsanRepository datsanRepository;


    @Override
    public List<UserDTO> getAllUser() {
        try {
            List<User> users = userRepository.findByVaiTro("USER");
            return users.stream()
                    .map(user -> new UserDTO(user.getHoTen(), user.getId(), user.getSoDienThoai()))
                    .toList();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách người dùng", e);
        }
    }


    @Override
    public String addSan(SanRequestDTO requestDTO) {
        San san = new San();
        san.setTenSan(requestDTO.getTenSan());
        san.setLoaiSan(requestDTO.getLoaiSan());
        Chinhanh cn = chiNhanhRepository.findById(requestDTO.getChiNhanhId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chi nhánh với ID: " + requestDTO.getChiNhanhId()));
        san.setChiNhanh(cn);

        san.setGiaSan(requestDTO.getGiaSan());
        try {
            sanRepository.save(san);
            return "Thêm sân thành công!";
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi thêm sân", e);
        }
    }

    @Override
    public String deleteSan(Long id) {
        try {
            if (!sanRepository.existsById(id)) {
                return "Không tìm thấy sân với ID: " + id;
            }
            sanRepository.deleteById(id);
            return "Xóa sân thành công!";
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa sân", e);
        }
    }
    @Override
    public String updateSan(Long id, UpdateSanDTO updateSanDTO) {
        try {
            San existing = sanRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sân với ID: " + id));

            existing.setTenSan(updateSanDTO.getTenSan());
            existing.setLoaiSan(updateSanDTO.getLoaiSan());
            existing.setGiaSan(updateSanDTO.getGiaSan());
            sanRepository.save(existing);
            return "Cập nhật sân thành công!";
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi cập nhật sân", e);
        }
    }

    @Override
    public String addChiNhanh(ChiNhanhCreationRequest request) {
        Chinhanh chinhanh = new Chinhanh();
        chinhanh.setTenChiNhanh(request.getTenChiNhanh());
        chinhanh.setDiaChi(request.getDiaChi());
        try {
            chiNhanhRepository.save(chinhanh);
            return "Thêm chi nhánh thành công!";
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi thêm chi nhánh", e);
        }
    }

    @Override
    public String addUser(User user) {
        // Kiểm tra vai trò của người dùng
        if ("admin".equalsIgnoreCase(user.getVaiTro())) {
            // Nếu là admin, cần phải có chi nhánh
            if (user.getChiNhanh() == null) {
                throw new IllegalArgumentException("Admin phải có chi nhánh.");
            }
        } else {
            // Nếu không phải admin, không cần chi nhánh
            user.setChiNhanh(null);
        }

        // Lưu User
        userRepository.save(user);
        return "Thêm người dùng thành công!";
    }

    @Override
    public List<QuanLyDatSanDTO> getAllDatSan() {
        List<Datsan> datsans = datsanRepository.findByTrangThai(TrangThai.DA_DAT);
        return datsans.stream().map(d -> {
            QuanLyDatSanDTO dto = new QuanLyDatSanDTO();
            dto.setIdDatSan(d.getId());
            dto.setTenSan(d.getSan().getTenSan());
            dto.setChiNhanh(d.getSan().getChiNhanh().getTenChiNhanh());
            dto.setNgayDat(d.getNgay());
            dto.setTrangThaiThanhToan(d.getTrangThai().name());
            return dto;
        }).collect(Collectors.toList());
    }
    @Override
    public ChiTietDatSanDTO getDetailDatSan(Long id) {
        Datsan datsan = datsanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đặt sân"));

        ChiTietDatSanDTO dto = new ChiTietDatSanDTO();
        dto.setTenSan(datsan.getSan().getTenSan());
        dto.setChiNhanh(datsan.getSan().getChiNhanh().getTenChiNhanh());
        dto.setNgayDat(datsan.getNgay());
        dto.setTrangThaiThanhToan(datsan.getTrangThai().name());
        dto.setKhungGio(datsan.getKhungGioCoDinh().getKhungGio());
        dto.setGiaTien(datsan.getSan().getGiaSan());

        return dto;
    }

}
