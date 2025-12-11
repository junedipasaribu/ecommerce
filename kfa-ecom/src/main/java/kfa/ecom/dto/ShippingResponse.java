package kfa.ecom.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ShippingResponse {

    private Long orderId;
    private String orderCode;
    private String trackingNumber;
    private String courierName;
    private String shippingStatus;
    private LocalDateTime shippedDate;
    private LocalDateTime deliveredDate;
    private String customerName;
    private String customerAddress;
}
