package kfa.ecom.service;

import jakarta.transaction.Transactional;
import kfa.ecom.dto.CheckoutRequest;
import kfa.ecom.dto.CheckoutResponse;
import kfa.ecom.dto.OrderItemResponse;
import kfa.ecom.dto.OrderResponse;
import kfa.ecom.entity.*;
import kfa.ecom.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final CustomerAddressRepository customerAddressRepository;

    /**
     * CHECKOUT dengan addressId + courierName + paymentMethod
     */
    public CheckoutResponse checkout(Long userId, CheckoutRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> items = cartItemRepository.findByCart(cart);
        if (items.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        CustomerAddress address = customerAddressRepository.findById(req.getAddressId())
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not allowed to use this address");
        }

        // Validasi stok
        for (CartItem ci : items) {
            Product p = ci.getProduct();
            if (p.getStock() == null || p.getStock() < ci.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + p.getName());
            }
        }

        double itemsTotal = items.stream()
                .mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity())
                .sum();

        double shippingCost = calculateShippingCost(req.getCourierName(), address, items);
        double grandTotal = itemsTotal + shippingCost;

        // Kurangi stok
        for (CartItem ci : items) {
            Product p = ci.getProduct();
            p.setStock(p.getStock() - ci.getQuantity());
            productRepository.save(p);
        }

        String paymentMethod = (req.getPaymentMethod() == null || req.getPaymentMethod().isBlank())
                ? "KFA_PAY"
                : req.getPaymentMethod();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(60);

        // 🔥 Snapshot alamat (sesuai field CustomerAddress)
        String fullAddressSnapshot =
                address.getReceiver() + " | " + address.getPhone() + " | " +
                        address.getFullAddress() + ", " + address.getCity() +
                        ", " + address.getProvince() + " - " + address.getPostalCode();

        Order order = Order.builder()
                .orderCode("ORD-" + UUID.randomUUID())
                .user(user)
                .totalAmount(grandTotal)
                .status("PENDING_PAYMENT")
                .paymentMethod(paymentMethod)
                .address(fullAddressSnapshot)
                .courierName(req.getCourierName())
                .shippingCost(shippingCost)
                .createdAt(now)
                .expiresAt(expiresAt)
                .build();

        Order savedOrder = orderRepository.save(order);

        for (CartItem ci : items) {
            OrderItem oi = OrderItem.builder()
                    .order(savedOrder)
                    .product(ci.getProduct())
                    .quantity(ci.getQuantity())
                    .price(ci.getProduct().getPrice())
                    .build();
            orderItemRepository.save(oi);
        }

        // Hapus cart setelah sukses checkout
        cartItemRepository.deleteAll(items);

        return CheckoutResponse.builder()
                .orderId(savedOrder.getId())
                .orderCode(savedOrder.getOrderCode())
                .totalAmount(savedOrder.getTotalAmount())
                .status(savedOrder.getStatus())
                .paymentMethod(savedOrder.getPaymentMethod())
                .message(
                        "Checkout pengiriman dengan kurir " + savedOrder.getCourierName() +
                                ". Selesaikan pembayaran dalam 60 menit via " + savedOrder.getPaymentMethod() + "."
                )
                .build();
    }

    private double calculateShippingCost(String courierName, CustomerAddress address, List<CartItem> items) {
        return 20000.0; // FLAT RATE
    }

    @Transactional
    public void cancelOrderByUser(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not allowed to cancel this order");
        }

        if (!"PENDING_PAYMENT".equals(order.getStatus())) {
            throw new RuntimeException("Only pending payment orders can be cancelled");
        }

        var orderItems = orderItemRepository.findByOrder(order);
        for (OrderItem oi : orderItems) {
            Product product = oi.getProduct();
            product.setStock(product.getStock() + oi.getQuantity());
            productRepository.save(product);
        }

        order.setStatus("CANCELLED_BY_USER");
        orderRepository.save(order);
    }

    public OrderResponse mapToResponse(Order order) {
        var items = orderItemRepository.findByOrder(order).stream()
                .map(oi -> OrderItemResponse.builder()
                        .productId(oi.getProduct().getId())
                        .productName(oi.getProduct().getName())
                        .price(oi.getPrice())
                        .quantity(oi.getQuantity())
                        .build()
                ).toList();

        return OrderResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .expiresAt(order.getExpiresAt())
                .paymentMethod(order.getPaymentMethod())
                .address(order.getAddress())
                .items(items)
                .build();
    }

    public List<OrderResponse> getMyOrders(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public OrderResponse getMyOrderDetail(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not allowed to view this order");
        }

        return mapToResponse(order);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public OrderResponse getOrderDetailAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToResponse(order);
    }
}
