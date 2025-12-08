package kfa.ecom.service;

import kfa.ecom.dto.ShippingRequest;
import kfa.ecom.entity.Order;
import kfa.ecom.entity.Shipping;
import kfa.ecom.repository.OrderRepository;
import kfa.ecom.repository.ShippingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * ShippingService mengelola input resi oleh Admin
 * dan update status pengiriman oleh kurir.
 */
@Service
@RequiredArgsConstructor
public class ShippingService {

    private final OrderRepository orderRepository;
    private final ShippingRepository shippingRepository;

    /**
     * Diinput oleh Admin saat pesanan mulai dikirim.
     */
    public void addTracking(ShippingRequest req) {
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Shipping shipping = Shipping.builder()
                .order(order)
                .trackingNumber(req.getTrackingNumber())
                .courierName(req.getCourier())
                .shippingStatus("ON_DELIVERY")
                .shippedDate(LocalDateTime.now())
                .build();

        shippingRepository.save(shipping);

        // update status order
        order.setStatus("SHIPPING");
        orderRepository.save(order);
    }

    /**
     * Dipanggil oleh sistem kurir untuk update status barang tiba.
     */
    public void updateShippingStatus(Long orderId, String status) {
        Shipping shipping = shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Shipping not found"));

        shipping.setShippingStatus(status);

        if (status.equalsIgnoreCase("DELIVERED")) {
            shipping.setDeliveredDate(LocalDateTime.now());
        }
        shippingRepository.save(shipping);

        // update status order
        Order order = shipping.getOrder();
        if (status.equalsIgnoreCase("DELIVERED")) {
            order.setStatus("COMPLETED");
        }
        orderRepository.save(order);
    }
}
