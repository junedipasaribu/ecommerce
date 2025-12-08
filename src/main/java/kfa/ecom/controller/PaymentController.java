package kfa.ecom.controller;

import kfa.ecom.dto.PaymentRequest;
import kfa.ecom.service.PaymentService;
import kfa.ecom.util.JwtUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final JwtUser jwtUser;

    @PostMapping("/pay/{orderId}")
    public ResponseEntity<?> pay(@PathVariable Long orderId, @RequestBody PaymentRequest req) {
        Long userId = jwtUser.getUserId();
        paymentService.pay(userId, orderId, req);
        return ResponseEntity.ok("Payment success");
    }
}
