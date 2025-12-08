package kfa.ecom.controller;

import kfa.ecom.dto.ShippingRequest;
import kfa.ecom.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller untuk input resi oleh admin dan update status oleh kurir.
 */
@RestController
@RequestMapping("/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingService service;

    /**
     * Input nomor resi oleh Admin.
     */
    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody ShippingRequest req){
        service.addTracking(req);
        return ResponseEntity.ok("Shipping Updated");
    }

    /**
     * Update status oleh sistem kurir.
     * Contoh request: /shipping/status?orderId=2&status=DELIVERED
     */
    @PatchMapping("/status")
    public ResponseEntity<?> updateStatus(@RequestParam Long orderId, @RequestParam String status){
        service.updateShippingStatus(orderId, status);
        return ResponseEntity.ok("Shipping Status Updated");
    }
}
