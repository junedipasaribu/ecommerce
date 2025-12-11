package kfa.ecom.controller;

import kfa.ecom.dto.ShippingRequest;
import kfa.ecom.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller untuk input resi & update status oleh ADMIN.
 */
@RestController
@RequestMapping("/api/admin/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingService service;

    /**
     * ADMIN: input nomor resi dan mulai pengiriman.
     */
    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody ShippingRequest req){
        try {
            service.addTracking(req);
            return ResponseEntity.ok("Shipping created / updated & order status set to SHIPPING");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error adding tracking: " + e.getMessage());
        }
    }

    /**
     * ADMIN: update status pengiriman.
     * Contoh: /api/admin/shipping/status?orderId=2&status=DELIVERED
     */
    @PatchMapping("/status")
    public ResponseEntity<?> updateStatus(@RequestParam Long orderId,
                                          @RequestParam String status){
        service.updateShippingStatus(orderId, status);
        return ResponseEntity.ok("Shipping status updated");
    }

    /**
     * ADMIN: Get all shipping data
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllShipping() {
        return ResponseEntity.ok(service.getAllShipping());
    }

    /**
     * ADMIN: Get shipping by order ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getShippingByOrderId(@PathVariable Long orderId) {
        try {
            return ResponseEntity.ok(service.getShippingByOrderId(orderId));
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Shipping not found: " + e.getMessage());
        }
    }

    /**
     * ADMIN: Get shipping by tracking number
     */
    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<?> getShippingByTrackingNumber(@PathVariable String trackingNumber) {
        try {
            return ResponseEntity.ok(service.getShippingByTrackingNumber(trackingNumber));
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Shipping not found: " + e.getMessage());
        }
    }
}
