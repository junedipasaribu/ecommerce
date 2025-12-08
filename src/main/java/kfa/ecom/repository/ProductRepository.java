package kfa.ecom.repository;

import kfa.ecom.entity.Category;
import kfa.ecom.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository Product untuk query produk.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(Category category);
}
