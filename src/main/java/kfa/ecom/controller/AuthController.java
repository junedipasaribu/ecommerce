package kfa.ecom.controller;

import kfa.ecom.dto.LoginRequest;
import kfa.ecom.dto.RegisterRequest;
import kfa.ecom.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
@RequiredArgsConstructor   // menggantikan constructor manual
public class AuthController {

    private final AuthService authService;

    /**
     * Login user → return JWT token + profile user
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Register user baru
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        return ResponseEntity.ok(authService.register(request));
    }
}
