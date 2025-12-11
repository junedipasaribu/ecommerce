package kfa.ecom.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Category digunakan untuk mengelompokkan produk berdasarkan gejala.
 */
@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;
}
