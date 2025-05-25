package Main.controller;

import Main.dto.request.LoginRequest;
import Main.dto.request.SignupRequest;
import Main.entity.User;
import Main.repository.UserRepository;
import Main.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        logger.debug("Attempting to authenticate user with email: {}", loginRequest.getEmail());
        
        try {
            // Check if user exists
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            logger.debug("Found user: email={}, role={}", user.getEmail(), user.getVaiTro());
            
            // Verify password
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getMatKhau())) {
                logger.error("Password mismatch for user: {}", loginRequest.getEmail());
                return ResponseEntity.status(401).body("Invalid password");
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);
            
            logger.debug("User authenticated successfully. Generated JWT token.");

            Map<String, String> response = new HashMap<>();
            response.put("token", jwt);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Authentication failed for user: " + loginRequest.getEmail(), e);
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Email đã được sử dụng!");
        }

        User user = new User();
        user.setHoTen(signupRequest.getHoTen());
        user.setEmail(signupRequest.getEmail());
        user.setMatKhau(passwordEncoder.encode(signupRequest.getPassword()));
        user.setSoDienThoai(signupRequest.getSoDienThoai());
        user.setVaiTro("USER"); // Luôn set vai trò là USER

        userRepository.save(user);

        return ResponseEntity.ok("Đăng ký thành công!");
    }

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Email đã được sử dụng!");
        }

        User admin = new User();
        admin.setHoTen(signupRequest.getHoTen());
        admin.setEmail(signupRequest.getEmail());
        admin.setMatKhau(passwordEncoder.encode(signupRequest.getPassword()));
        admin.setSoDienThoai(signupRequest.getSoDienThoai());
        admin.setVaiTro("ADMIN");

        userRepository.save(admin);
        logger.debug("Created admin user: email={}, role={}", admin.getEmail(), admin.getVaiTro());

        return ResponseEntity.ok("Tạo tài khoản admin thành công!");
    }
} 