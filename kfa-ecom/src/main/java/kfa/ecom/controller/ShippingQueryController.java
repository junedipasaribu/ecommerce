package kfa.ecom.controller;

import kfa.ecom.dto.ShippingResponse;
import kfa.ecom.service.ShippingService;
import kfa.ecom.config.JwtUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
public class ShippingQueryController {

    private final ShippingService shippingService;
    private final JwtUser jwtUser;

    /**
     * USER: lihat tracking pengiriman berdasarkan orderId.
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<ShippingResponse> getTracking(@PathVariable Long orderId) {
        Long userId = jwtUser.getUserId();
        return ResponseEntity.ok(shippingService.getTracking(userId, orderId));
    }
}
