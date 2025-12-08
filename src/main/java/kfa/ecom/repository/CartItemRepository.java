package kfa.ecom.repository;

import kfa.ecom.entity.Cart;
import kfa.ecom.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository CartItem.
 */
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCart(Cart cart);
}
