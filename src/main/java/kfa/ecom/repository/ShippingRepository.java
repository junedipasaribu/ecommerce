package kfa.ecom.repository;

import kfa.ecom.entity.Shipping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository Shipping.
 */
public interface ShippingRepository extends JpaRepository<Shipping, Long> {
    Optional<Shipping> findByOrderId(Long orderId);
}
