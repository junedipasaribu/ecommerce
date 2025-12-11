package kfa.ecom.service;

import kfa.ecom.dto.AdminUserRequest;
import kfa.ecom.dto.UserResponse;
import kfa.ecom.dto.UserUpdateRequest;
import kfa.ecom.entity.CustomerAddress;
import kfa.ecom.entity.Order;
import kfa.ecom.entity.User;
import kfa.ecom.repository.CustomerAddressRepository;
import kfa.ecom.repository.OrderRepository;
import kfa.ecom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CustomerAddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * USER: Get my profile with addresses and stats
     */
    public UserResponse getMyProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return buildUserResponse(user);
    }

    /**
     * USER: Update my profile (limited fields)
     */
    public UserResponse updateMyProfile(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update only allowed fields
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        User savedUser = userRepository.save(user);
        return buildUserResponse(savedUser);
    }

    /**
     * ADMIN: Get all users with pagination
     */
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAllByOrderByCreatedAtDesc();
        return users.stream()
                .map(this::buildUserResponse)
                .toList();
    }

    /**
     * ADMIN: Get user by ID
     */
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return buildUserResponse(user);
    }

    /**
     * ADMIN: Create new user
     */
    public UserResponse createUser(AdminUserRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(request.getRole() != null ? request.getRole() : "USER")
                .password(passwordEncoder.encode(request.getPassword()))
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);
        return buildUserResponse(savedUser);
    }

    /**
     * ADMIN: Update user
     */
    public UserResponse updateUser(Long userId, AdminUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update fields
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            // Check if new email already exists (excluding current user)
            userRepository.findByEmail(request.getEmail())
                    .filter(existingUser -> !existingUser.getId().equals(userId))
                    .ifPresent(existingUser -> {
                        throw new RuntimeException("Email already exists");
                    });
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User savedUser = userRepository.save(user);
        return buildUserResponse(savedUser);
    }

    /**
     * ADMIN: Delete user
     */
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has active orders
        List<Order> activeOrders = orderRepository.findByUserAndStatusNotIn(
                user, 
                List.of("COMPLETED", "CANCELLED_BY_USER", "CANCELLED_BY_ADMIN", "EXPIRED")
        );

        if (!activeOrders.isEmpty()) {
            throw new RuntimeException("Cannot delete user with active orders");
        }

        userRepository.delete(user);
    }

    /**
     * ADMIN: Get user statistics
     */
    public UserResponse.UserStats getUserStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Order> userOrders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        
        long totalOrders = userOrders.size();
        long completedOrders = userOrders.stream()
                .filter(order -> "COMPLETED".equals(order.getStatus()))
                .count();
        
        double totalSpent = userOrders.stream()
                .filter(order -> !"CANCELLED_BY_USER".equals(order.getStatus()) 
                        && !"CANCELLED_BY_ADMIN".equals(order.getStatus())
                        && !"EXPIRED".equals(order.getStatus()))
                .mapToDouble(Order::getTotalAmount)
                .sum();

        String memberSince = user.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
        
        String lastOrderDate = userOrders.isEmpty() ? "No orders yet" :
                userOrders.get(0).getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

        return UserResponse.UserStats.builder()
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .totalSpent(totalSpent)
                .memberSince(memberSince)
                .lastOrderDate(lastOrderDate)
                .build();
    }

    /**
     * Helper method to build UserResponse
     */
    private UserResponse buildUserResponse(User user) {
        List<CustomerAddress> addresses = addressRepository.findByUserIdOrderByIsPrimaryDescCreatedAtDesc(user.getId());
        CustomerAddress primaryAddress = addresses.stream()
                .filter(CustomerAddress::getIsPrimary)
                .findFirst()
                .orElse(null);

        UserResponse.UserStats stats = getUserStats(user.getId());

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .addresses(addresses)
                .primaryAddress(primaryAddress)
                .stats(stats)
                .build();
    }
}