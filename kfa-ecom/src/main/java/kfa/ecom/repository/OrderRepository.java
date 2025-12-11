package kfa.ecom.repository;

import kfa.ecom.entity.Order;
import kfa.ecom.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Order history user
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    // Order list admin
    List<Order> findAllByOrderByCreatedAtDesc();

    // Scheduler auto cancel
    List<Order> findByStatusAndExpiresAtBefore(String status, LocalDateTime time);

    // Dashboard queries
    List<Order> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
    List<Order> findTop10ByOrderByCreatedAtDesc();

    // User management queries
    List<Order> findByUserAndStatusNotIn(User user, List<String> statuses);
}
