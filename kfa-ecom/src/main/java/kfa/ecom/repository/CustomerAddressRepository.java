package kfa.ecom.repository;

import kfa.ecom.entity.CustomerAddress;
import kfa.ecom.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Long> {
    List<CustomerAddress> findByUserOrderByCreatedAtDesc(User user);
    Optional<CustomerAddress> findByUserAndIsPrimaryTrue(User user);
    
    // User management queries
    List<CustomerAddress> findByUserIdOrderByIsPrimaryDescCreatedAtDesc(Long userId);
}
