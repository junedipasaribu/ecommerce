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
    private Double totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private String paymentMethod;
    private String address;
    private List<OrderItemResponse> items;
}
