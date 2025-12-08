package kfa.ecom.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartItemResponse {
    private Long productId;
    private String name;
    private double price;
    private int quantity;
    private double subtotal;
}
