package kfa.ecom.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CheckoutResponse {
    private Long orderId;
    private String orderCode;
    private Double totalAmount;
    private String status;
    private String paymentMethod;
    private String message;
}
