package kfa.ecom.service;

import kfa.ecom.dto.*;
import kfa.ecom.entity.*;
import kfa.ecom.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    private Cart getOrCreateCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return cartRepository.findByUser(user)
                .orElseGet(() -> cartRepository.save(
                        Cart.builder().user(user).createdAt(LocalDateTime.now()).build()
                ));
    }

    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        var items = cartItemRepository.findByCart(cart);

        var mapped = items.stream().map(i -> CartItemResponse.builder()
                .productId(i.getProduct().getId())
                .name(i.getProduct().getName())
                .price(i.getProduct().getPrice())
                .quantity(i.getQuantity())
                .subtotal(i.getProduct().getPrice() * i.getQuantity())
                .build()
        ).collect(Collectors.toList());

        double total = mapped.stream().mapToDouble(CartItemResponse::getSubtotal).sum();

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(mapped)
                .total(total)
                .build();
    }

    public void addItem(Long userId, CartRequest req) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem item = CartItem.builder()
                .cart(cart)
                .product(product)
                .quantity(req.getQuantity())
                .build();

        cartItemRepository.save(item);
    }

    public void updateQuantity(Long userId, CartRequest req) {
        Cart cart = getOrCreateCart(userId);
        var itemList = cartItemRepository.findByCart(cart);

        itemList.forEach(i -> {
            if (i.getProduct().getId().equals(req.getProductId())) {
                i.setQuantity(req.getQuantity());
                cartItemRepository.save(i);
            }
        });
    }

    public void removeItem(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);
        var items = cartItemRepository.findByCart(cart);

        items.stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .ifPresent(cartItemRepository::delete);
    }

    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        var items = cartItemRepository.findByCart(cart);
        cartItemRepository.deleteAll(items);
    }

    public int countItems(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return cartItemRepository.findByCart(cart)
                .stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }


}
