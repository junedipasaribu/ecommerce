package kfa.ecom.repository;

import kfa.ecom.entity.Category;
import kfa.ecom.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository Product untuk query produk.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(Category category);
    
    @Modifying
    @Query(value = "ALTER SEQUENCE products_id_seq RESTART WITH 1000", nativeQuery = true)
    void resetSequence();

    // Dashboard queries
    long countByStockLessThan(int stock);
    
    // Count new products (created within specified days)
    long countByCreatedAtAfter(LocalDateTime date);
}
