package kfa.ecom.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long orderId;
    private String orderCode;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private Double totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private String paymentMethod;
    private String address;
    private String courierName;
    private Double shippingCost;
    private List<OrderItemResponse> items;
}
