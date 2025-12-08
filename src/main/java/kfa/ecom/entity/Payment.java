package kfa.ecom.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Payment menyimpan status pembayaran untuk suatu order.
 */
@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // relasi ke order
    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "payment_status")
    private String paymentStatus; // SUCCESS / FAILED

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;
}
