package kfa.ecom.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Order adalah pesanan yang terbentuk setelah checkout.
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", unique = true)
    private String orderCode;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "total_amount")
    private Double totalAmount;   // total barang + ongkir

    private String status;        // PENDING_PAYMENT, PAYMENT_SUCCESS, CANCELLED_BY_USER, CANCELLED_AUTO, dll

    @Column(name = "payment_method")
    private String paymentMethod; // contoh: "KFA_PAY"

    private String address;       // alamat kirim (sementara 1 string)

    @Column(name = "courier_name")
    private String courierName;   // contoh: "GO KFA"

    @Column(name = "shipping_cost")
    private Double shippingCost;  // ongkir

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;  // waktu kadaluarsa pembayaran (60 menit)
}
