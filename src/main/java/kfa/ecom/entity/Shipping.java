package kfa.ecom.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Shipping menyimpan informasi pengiriman untuk suatu order.
 */
@Entity
@Table(name = "shippings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // relasi ke order
    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "courier_name")
    private String courierName;

    @Column(name = "shipping_status")
    private String shippingStatus; // ON_DELIVERY, DELIVERED, RETURNED

    @Column(name = "shipped_date")
    private LocalDateTime shippedDate;

    @Column(name = "delivered_date")
    private LocalDateTime deliveredDate;
}
