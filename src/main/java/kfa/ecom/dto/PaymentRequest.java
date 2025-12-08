package kfa.ecom.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private String paymentReference;
    private String pin; // PIN 6 digit untuk otorisasi pembayaran
}
