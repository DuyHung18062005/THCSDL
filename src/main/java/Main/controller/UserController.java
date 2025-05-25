package Main.controller;

import Main.dto.request.ChiNhanhDTO;
import Main.dto.request.DatSanRequest;
import Main.dto.request.SanDTO;
import Main.dto.request.SanInfoDTO;
import Main.entity.San;
import Main.entity.User;
import Main.repository.UserRepository;
import Main.service.DatSanService;
import Main.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private DatSanService datSanService;
    @Autowired
    private UserRepository userRepository;

    // Lấy tất cả sân
    @GetMapping("/all")
    public List<SanInfoDTO> getAllSan() {

        return userService.getAllSan();
    }

    // Xem tất cả các chi nhánh
    @GetMapping("/chiNhanh")
    public List<ChiNhanhDTO> getAllChiNhanh() {
        return userService.getAllChiNhanh();
    }

    // Lấy sân theo khu vực (chi nhánh ID)
    @GetMapping("/khuVuc")
    public List<SanInfoDTO> getKhuVuc(@RequestParam Long chiNhanhId) {
        return userService.filterSanByKhuVuc(chiNhanhId);
    }

    // Lấy sân theo tên
    @GetMapping("/ten")
    public San getTen(@RequestParam String ten) {
        return userService.filterSanByTen(ten);
    }

//    // Tìm kiếm sân theo loại sân
//    @GetMapping("/loaiSan")
//    public List<San> getSanByLoai(@RequestParam String loaiSan) {
//        return userService.filterSanByLoaiSan(loaiSan);
//    }
    // Lấy thông tin sân theo ID - sau khi xem các sân thì vào xem thông tin chi tiết sân để đặt sân

    @GetMapping("/{id}")
    public SanDTO getSan(@PathVariable Long id) {
        return userService.getSanInfoById(id);
    }

    @PostMapping("/datSan")
    public String datSan(@RequestBody DatSanRequest request) {
        return datSanService.datSan(
                request.getSanId(),
                request.getUserId(),
                request.getKhungGioCoDinhId(),
                request.getNgay()
        );
    }

    // Thanh toán

    @GetMapping("/role/user")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findByVaiTro("USER");
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy danh sách user: " + e.getMessage());
        }
    }
}
