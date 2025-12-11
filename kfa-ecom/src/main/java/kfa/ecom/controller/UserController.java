package kfa.ecom.controller;

import kfa.ecom.config.JwtUser;
import kfa.ecom.dto.AdminUserRequest;
import kfa.ecom.dto.UserResponse;
import kfa.ecom.dto.UserUpdateRequest;
import kfa.ecom.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUser jwtUser;

    // ========== USER ENDPOINTS ==========

    /**
     * USER: Get my profile with addresses and statistics
     */
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getMyProfile() {
        try {
            Long userId = jwtUser.getUserId();
            UserResponse profile = userService.getMyProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * USER: Update my profile (limited fields only)
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateMyProfile(@RequestBody UserUpdateRequest request) {
        try {
            Long userId = jwtUser.getUserId();
            UserResponse updatedProfile = userService.updateMyProfile(userId, request);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error updating profile: " + e.getMessage());
        }
    }

    /**
     * USER: Get my statistics only
     */
    @GetMapping("/profile/stats")
    public ResponseEntity<?> getMyStats() {
        try {
            Long userId = jwtUser.getUserId();
            UserResponse.UserStats stats = userService.getUserStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error getting user stats: " + e.getMessage());
        }
    }

    // ========== ADMIN ENDPOINTS ==========

    /**
     * ADMIN: Get all users
     */
    @GetMapping("/admin/all")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        try {
            List<UserResponse> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * ADMIN: Get user by ID
     */
    @GetMapping("/admin/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            UserResponse user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("User not found: " + e.getMessage());
        }
    }

    /**
     * ADMIN: Create new user
     */
    @PostMapping("/admin/create")
    public ResponseEntity<?> createUser(@RequestBody AdminUserRequest request) {
        try {
            // Validate required fields
            if (request.getName() == null || request.getEmail() == null || request.getPassword() == null) {
                return ResponseEntity.status(400).body("Name, email, and password are required");
            }

            UserResponse newUser = userService.createUser(request);
            return ResponseEntity.ok(newUser);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error creating user: " + e.getMessage());
        }
    }

    /**
     * ADMIN: Update user
     */
    @PutMapping("/admin/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody AdminUserRequest request) {
        try {
            UserResponse updatedUser = userService.updateUser(userId, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error updating user: " + e.getMessage());
        }
    }

    /**
     * ADMIN: Delete user
     */
    @DeleteMapping("/admin/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error deleting user: " + e.getMessage());
        }
    }

    /**
     * ADMIN: Get user statistics by ID
     */
    @GetMapping("/admin/{userId}/stats")
    public ResponseEntity<?> getUserStats(@PathVariable Long userId) {
        try {
            UserResponse.UserStats stats = userService.getUserStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("User not found: " + e.getMessage());
        }
    }

    /**
     * Test endpoint
     */
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("User controller is working!");
    }
}