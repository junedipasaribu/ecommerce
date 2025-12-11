package kfa.ecom.dto;

import lombok.Data;

@Data
public class ShippingRequest {
    private Long orderId;
    private String courier;
    private String trackingNumber;
}
