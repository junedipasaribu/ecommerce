package kfa.ecom.dto;

import lombok.Data;

@Data
public class PaymentCallbackRequest {
    private Long orderId;
    private String status;       // SUCCESS / FAILED
    private String orderCode;    // reference from gateway
    private String paymentRef;   // payment reference number
}
