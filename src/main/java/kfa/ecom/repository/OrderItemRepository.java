package kfa.ecom.repository;

import kfa.ecom.entity.Order;
import kfa.ecom.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);  // ⬅ untuk restock saat cancel/auto-cancel
}
