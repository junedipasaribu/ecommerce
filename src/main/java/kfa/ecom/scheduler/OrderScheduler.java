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

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderScheduler {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    /**
     * Scheduler untuk membatalkan order otomatis jika melewati 60 menit tanpa pembayaran.
     * Berjalan setiap 1 menit.
     */
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void cancelExpiredOrders() {
        LocalDateTime now = LocalDateTime.now();

        // ambil order yang pending & sudah expired
        List<Order> expiredOrders = orderRepository.findByStatusAndExpiresAtBefore("PENDING_PAYMENT", now);

        if (expiredOrders.isEmpty()) {
            return;
        }

        for (Order order : expiredOrders) {
            log.info("AUTO CANCEL — Order {} expired at {}", order.getOrderCode(), order.getExpiresAt());

            List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
            for (OrderItem oi : orderItems) {
                var product = oi.getProduct();
                product.setStock(product.getStock() + oi.getQuantity()); // kembalikan stok
                productRepository.save(product);
            }

            order.setStatus("CANCELLED_AUTO");
            orderRepository.save(order);
        }
    }
}
