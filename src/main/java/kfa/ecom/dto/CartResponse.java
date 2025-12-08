package kfa.ecom.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class CartResponse {
    private Long cartId;
    private List<CartItemResponse> items;
    private double total;
}
