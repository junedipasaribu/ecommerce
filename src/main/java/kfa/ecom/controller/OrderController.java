package kfa.ecom.controller;

import kfa.ecom.dto.CheckoutRequest;
import kfa.ecom.dto.CheckoutResponse;
import kfa.ecom.dto.OrderResponse;
import kfa.ecom.service.OrderService;
import kfa.ecom.util.JwtUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")   // 🔥 WAJIB SUPAYA POST TIDAK 403
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final JwtUser jwtUser;

    /** CHECKOUT */
    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(@RequestBody CheckoutRequest req) {
        Long userId = jwtUser.getUserId();  // 🔥 jaga agar userId tidak null
        return ResponseEntity.ok(orderService.checkout(userId, req));
    }

    /** LIST ORDER SAYA */
    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> myOrders() {
        Long userId = jwtUser.getUserId();
        return ResponseEntity.ok(orderService.getMyOrders(userId));
    }

    /** DETAIL ORDER */
    @GetMapping("/my/{orderId}")
    public ResponseEntity<OrderResponse> myOrderDetail(@PathVariable Long orderId) {
        Long userId = jwtUser.getUserId();
        return ResponseEntity.ok(orderService.getMyOrderDetail(userId, orderId));
    }

    /** CANCEL ORDER OLEH USER */
    @PatchMapping("/cancel/{orderId}")
    public ResponseEntity<?> cancelOrderByUser(@PathVariable Long orderId) {
        Long userId = jwtUser.getUserId();
        orderService.cancelOrderByUser(userId, orderId);
        return ResponseEntity.ok("Order cancelled by user");
    }
}
