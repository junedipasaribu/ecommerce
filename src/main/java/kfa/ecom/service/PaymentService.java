package kfa.ecom.service;

import kfa.ecom.dto.PaymentRequest;
import kfa.ecom.entity.Order;
import kfa.ecom.entity.Payment;
import kfa.ecom.entity.User;
import kfa.ecom.repository.OrderRepository;
import kfa.ecom.repository.PaymentRepository;
import kfa.ecom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    public void pay(Long userId, Long orderId, PaymentRequest req) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not allowed to pay this order");
        }

        if (!order.getStatus().equals("PENDING_PAYMENT")) {
            throw new RuntimeException("Order is not available for payment");
        }

        if (!encoder.matches(req.getPin(), user.getPin())) {
            throw new RuntimeException("Invalid PIN");
        }

        Payment payment = Payment.builder()
                .order(order)
                .paymentStatus("PAID")
                .paymentReference("PAY-" + UUID.randomUUID())
                .paymentDate(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        order.setStatus("PAID");
        orderRepository.save(order);
    }
}
