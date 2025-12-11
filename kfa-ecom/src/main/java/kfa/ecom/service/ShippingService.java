package kfa.ecom.service;

import kfa.ecom.dto.ShippingRequest;
import kfa.ecom.dto.ShippingResponse;
import kfa.ecom.entity.Order;
import kfa.ecom.entity.Shipping;
import kfa.ecom.repository.OrderRepository;
import kfa.ecom.repository.ShippingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * ShippingService mengelola input resi oleh Admin
 * dan tracking pengiriman untuk User.
 */
@Service
@RequiredArgsConstructor
public class ShippingService {

    private final OrderRepository orderRepository;
    private final ShippingRepository shippingRepository;

    /**
     * ADMIN: Diinput saat pesanan mulai dikirim.
     * - Membuat record shipping
     * - Mengubah status order menjadi "SHIPPING"
     */
    public void addTracking(ShippingRequest req) {
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Allow shipping for any order status (admin can add tracking anytime)
        // Removed status validation - admin has full control

        // jika shipping sudah ada, update saja tracking-nya
        Shipping shipping = shippingRepository.findByOrderId(order.getId())
                .orElse(Shipping.builder()
                        .order(order)
                        .build()
                );

        shipping.setTrackingNumber(req.getTrackingNumber());
        shipping.setCourierName(req.getCourier());
        shipping.setShippingStatus("ON_DELIVERY");
        if (shipping.getShippedDate() == null) {
            shipping.setShippedDate(LocalDateTime.now());
        }

        shippingRepository.save(shipping);

        // update status order
        order.setStatus("SHIPPING");
        orderRepository.save(order);
    }

    /**
     * ADMIN: update status pengiriman (contoh: DELIVERED, RETURNED, dll).
     * - Jika DELIVERED → isi deliveredDate
     * - Order TIDAK otomatis COMPLETED di sini (diselesaikan oleh user via O8)
     */
    public void updateShippingStatus(Long orderId, String status) {
        Shipping shipping = shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Shipping not found"));

        shipping.setShippingStatus(status);

        if (status.equalsIgnoreCase("DELIVERED")) {
            shipping.setDeliveredDate(LocalDateTime.now());
        }

        shippingRepository.save(shipping);
    }

    /**
     * USER: lihat status pengiriman untuk order miliknya.
     */
    public ShippingResponse getTracking(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not allowed to view this shipping");
        }

        Shipping shipping = shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Shipping not found"));

        // For user, return limited info (no customer details)
        return ShippingResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .trackingNumber(shipping.getTrackingNumber())
                .courierName(shipping.getCourierName())
                .shippingStatus(shipping.getShippingStatus())
                .shippedDate(shipping.getShippedDate())
                .deliveredDate(shipping.getDeliveredDate())
                .build();
    }

    // ========== ADMIN GET METHODS ==========

    /**
     * ADMIN: Get all shipping data
     */
    public java.util.List<ShippingResponse> getAllShipping() {
        return shippingRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * ADMIN: Get shipping by order ID
     */
    public ShippingResponse getShippingByOrderId(Long orderId) {
        Shipping shipping = shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Shipping not found for order ID: " + orderId));
        return mapToResponse(shipping);
    }

    /**
     * ADMIN: Get shipping by tracking number
     */
    public ShippingResponse getShippingByTrackingNumber(String trackingNumber) {
        Shipping shipping = shippingRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Shipping not found for tracking number: " + trackingNumber));
        return mapToResponse(shipping);
    }

    /**
     * Helper method to map Shipping entity to ShippingResponse
     */
    private ShippingResponse mapToResponse(Shipping shipping) {
        return ShippingResponse.builder()
                .orderId(shipping.getOrder().getId())
                .orderCode(shipping.getOrder().getOrderCode())
                .trackingNumber(shipping.getTrackingNumber())
                .courierName(shipping.getCourierName())
                .shippingStatus(shipping.getShippingStatus())
                .shippedDate(shipping.getShippedDate())
                .deliveredDate(shipping.getDeliveredDate())
                .customerName(shipping.getOrder().getUser().getName())
                .customerAddress(shipping.getOrder().getAddress())
                .build();
    }
}
