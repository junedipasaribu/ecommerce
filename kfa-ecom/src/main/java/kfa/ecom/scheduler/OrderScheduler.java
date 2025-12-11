package kfa.ecom.scheduler;

import kfa.ecom.entity.Order;
import kfa.ecom.entity.OrderItem;
import kfa.ecom.repository.OrderItemRepository;
import kfa.ecom.repository.OrderRepository;
import kfa.ecom.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderScheduler {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    /**
     * Run otomatis setiap 1 menit
     */
    @Scheduled(fixedRate = 60000)
    public void autoCancelExpiredOrders() {

        List<Order> orders =
                orderRepository.findByStatusAndExpiresAtBefore("PENDING_PAYMENT", LocalDateTime.now());

        if (orders.isEmpty()) return;

        for (Order order : orders) {

            List<OrderItem> orderItems = orderItemRepository.findByOrder(order);

            // kembalikan stok
            for (OrderItem oi : orderItems) {
                var product = oi.getProduct();
                product.setStock(product.getStock() + oi.getQuantity());
                productRepository.save(product);
            }

            order.setStatus("CANCELLED_AUTO");
            orderRepository.save(order);

            log.info("Order otomatis dibatalkan: {} (expired)", order.getOrderCode());
        }
    }
}
