package kfa.ecom.service;

import kfa.ecom.config.JwtUtil;
import kfa.ecom.dto.LoginRequest;
import kfa.ecom.dto.RegisterRequest;
import kfa.ecom.entity.User;
import kfa.ecom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public Map<String, Object> login(LoginRequest req) {

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Wrong password");
        }

        Map<String, Object> claims = Map.of(
                "userId", user.getId(),
                "role", user.getRole()
        );

        String token = jwtUtil.generateToken(user.getEmail(), claims);

        return Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole(),
                        "phone", user.getPhone(),
                        "address", user.getAddress()
                )
        );
    }

//    public void register(RegisterRequest req) {
//        User user = User.builder()
//                .name(req.getName())
//                .email(req.getEmail())
//                .password(passwordEncoder.encode(req.getPassword()))
//                .phone(req.getPhone())
//                .address(req.getAddress())
//                .pin(passwordEncoder.encode(req.getPin()))   // 🔥 HASH PIN
//                .role("USER")
//                .createdAt(LocalDateTime.now())
//                .build();
//
//        userRepository.save(user);
//    }
public Map<String, Object> register(RegisterRequest req) {
    User user = User.builder()
            .name(req.getName())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .phone(req.getPhone())
            .address(req.getAddress())
            .pin(passwordEncoder.encode(req.getPin()))   // 🔥 HASH PIN
            .role("USER")
            .createdAt(LocalDateTime.now())
            .build();

    User savedUser = userRepository.save(user);

    // Generate token untuk auto-login setelah register
    Map<String, Object> claims = Map.of(
            "userId", savedUser.getId(),
            "role", savedUser.getRole()
    );
    String token = jwtUtil.generateToken(savedUser.getEmail(), claims);

    return Map.of(
            "message", "Registration successful",
            "token", token,
            "user", Map.of(
                    "id", savedUser.getId(),
                    "name", savedUser.getName(),
                    "email", savedUser.getEmail(),
                    "role", savedUser.getRole(),
                    "phone", savedUser.getPhone() != null ? savedUser.getPhone() : "",
                    "address", savedUser.getAddress() != null ? savedUser.getAddress() : ""
            )
    );
}
}
