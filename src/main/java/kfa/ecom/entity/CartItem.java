package kfa.ecom.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * CartItem menyimpan item produk apa saja yang ada di dalam cart.
 */
@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // relasi ke cart
    @ManyToOne
    @JoinColumn(name = "cart_id")
    private Cart cart;

    // relasi ke product
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;
}
