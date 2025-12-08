package kfa.ecom.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String label;      // Rumah / Kantor / Kos / dll
    private String receiver;   // Nama penerima
    private String phone;      // No HP penerima
    private String fullAddress;
    private String city;
    private String province;
    private String postalCode;

    private Boolean isPrimary; // alamat utama

    private LocalDateTime createdAt;
}
