package Main.controller;

import Main.dto.request.*;
import Main.dto.response.UserResponseDTO;
import Main.entity.Chinhanh;
import Main.entity.San;
import Main.entity.User;
import Main.service.AdminService;
import Main.service.SanService;
import Main.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private SanService sanService;

    @Autowired
    private UserRepository userRepository;

    // QUẢN LÝ NGƯỜI DÙNG

    // Xem danh sách tất cả user có vai trò USER
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findByVaiTro("USER");
            List<UserResponseDTO> userDTOs = users.stream()
                .map(user -> new UserResponseDTO(
                    user.getId(),
                    user.getHoTen(),
                    user.getEmail(),
                    user.getSoDienThoai(),
                    user.getVaiTro()
                ))
                .collect(Collectors.toList());
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy danh sách user: " + e.getMessage());
        }
    }

    // Thêm user mới
    @PostMapping("/themuser")
    public String addUser(@RequestBody User user) {
        return adminService.addUser(user);
    }



    // QUẢN LÝ SÂN BÓNG
    //1. Xoá sân bóng theo ID
    @DeleteMapping("/sân/{id}")
    public String deleteSan(@PathVariable Long id) {
        return adminService.deleteSan(id);
    }

    //2. Cập nhật thông tin sân bóng
    @PutMapping("/sân/{id}")
    public String updateSan(@PathVariable Long id, @RequestBody UpdateSanDTO san) {
        return adminService.updateSan(id, san);
    }

    // Thêm chi nhánh mới
    @PostMapping("/themchinhanh")
    public String addChiNhanh(@RequestBody ChiNhanhCreationRequest request) {
        return adminService.addChiNhanh(request);
    }
    // Thêm sân mới
    @PostMapping("/san")
    public San taoSan(@RequestBody SanRequestDTO request) {
        return sanService.taoSanVaKhungGio(request);
    }


    // QUẢN LÝ THANH TOÁN
    // 1. Xem tất cả các sân đã được đặt
    @GetMapping("/quanlydat")
    public List<QuanLyDatSanDTO> getAllDatSan () {
        return adminService.getAllDatSan();
    }
    // 1. Xem chi tiết sân đã đặt
    @GetMapping("/quanlydat/{id}")
    public ChiTietDatSanDTO getDetailDatSan(@PathVariable Long id) {
        return adminService.getDetailDatSan(id);
    }
}
