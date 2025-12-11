package kfa.ecom.dto;

import lombok.Data;

@Data
public class CheckoutRequest {
    private Long addressId;
    private String courierName;
    private String paymentMethod; // default "KFA_PAY"
}
