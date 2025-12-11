package kfa.ecom.controller;

import kfa.ecom.dto.CheckoutRequest;
import kfa.ecom.dto.CheckoutResponse;
import kfa.ecom.dto.OrderResponse;
import kfa.ecom.service.OrderService;
import kfa.ecom.config.JwtUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final JwtUser jwtUser;

    /** CHECKOUT */
    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(@RequestBody CheckoutRequest req) {
        Long userId = jwtUser.getUserId();
        return ResponseEntity.ok(orderService.checkout(userId, req));
    }

    /** LIST ORDER SAYA */
    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> myOrders() {
        Long userId = jwtUser.getUserId();
        return ResponseEntity.ok(orderService.getMyOrders(userId));
    }

    /** DETAIL ORDER SAYA */
    @GetMapping("/my/{orderId}")
    public ResponseEntity<OrderResponse> myOrderDetail(@PathVariable Long orderId) {
        Long userId = jwtUser.getUserId();
        return ResponseEntity.ok(orderService.getMyOrderDetail(userId, orderId));
    }

    /** O5 — Cancel order oleh user */
    @PatchMapping("/cancel/{orderId}")
    public ResponseEntity<?> cancelOrderByUser(@PathVariable Long orderId) {
        Long userId = jwtUser.getUserId();
        orderService.cancelOrderByUser(userId, orderId);
        return ResponseEntity.ok("Order cancelled by user");
    }

    /** O8 — User konfirmasi barang diterima */
    @PostMapping("/completed/{orderId}")
    public ResponseEntity<?> confirmCompleted(@PathVariable Long orderId) {
        Long userId = jwtUser.getUserId();
        orderService.confirmOrderCompleted(userId, orderId);
        return ResponseEntity.ok("Order confirmed as COMPLETED");
    }

    // ========== ADMIN ENDPOINTS ==========

    /** ADMIN: Get all orders */
    @GetMapping("/admin/all")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /** ADMIN: Get order detail by ID */
    @GetMapping("/admin/{orderId}")
    public ResponseEntity<OrderResponse> getOrderDetail(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderDetailAdmin(orderId));
    }

    /** ADMIN: Update order status */
    @PatchMapping("/admin/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody UpdateOrderStatusRequest request) {
        try {
            orderService.updateOrderStatus(orderId, request.getStatus());
            return ResponseEntity.ok("Order status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error updating order status: " + e.getMessage());
        }
    }

    /** ADMIN: Cancel order */
    @PatchMapping("/admin/{orderId}/cancel")
    public ResponseEntity<?> cancelOrderByAdmin(@PathVariable Long orderId) {
        try {
            orderService.cancelOrderByAdmin(orderId);
            return ResponseEntity.ok("Order cancelled by admin");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error cancelling order: " + e.getMessage());
        }
    }

    // DTO for update status request
    public static class UpdateOrderStatusRequest {
        private String status;
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
