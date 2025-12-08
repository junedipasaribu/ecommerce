package kfa.ecom.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * OrderItem menyimpan detail produk di dalam suatu order.
 */
@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // relasi ke order
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    // produk yang dibeli
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;

    private Double price; // harga per item saat order dibuat
}
