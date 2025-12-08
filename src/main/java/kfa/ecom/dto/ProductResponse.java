package kfa.ecom.dto;

import lombok.Builder;
import lombok.Data;

/**
 * DTO untuk mengembalikan data produk ke FE.
 */
@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer stock;
    private String imageUrl;
    private String categoryName;
}
