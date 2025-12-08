package kfa.ecom.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponse {
    private Long orderId;
    private String orderCode;
    private String status;          // PAYMENT_SUCCESS / CANCELLED_AUTO / dll
    private String paymentStatus;   // SUCCESS
    private String message;
}
