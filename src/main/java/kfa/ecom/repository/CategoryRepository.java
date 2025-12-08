package kfa.ecom.repository;

import kfa.ecom.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository Category.
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {
}
