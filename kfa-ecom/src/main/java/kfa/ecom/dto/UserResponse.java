package kfa.ecom.dto;

import kfa.ecom.entity.CustomerAddress;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String role;
    private LocalDateTime createdAt;
    private List<CustomerAddress> addresses;
    private CustomerAddress primaryAddress;
    private UserStats stats;

    @Data
    @Builder
    public static class UserStats {
        private Long totalOrders;
        private Long completedOrders;
        private Double totalSpent;
        private String memberSince;
        private String lastOrderDate;
    }
}