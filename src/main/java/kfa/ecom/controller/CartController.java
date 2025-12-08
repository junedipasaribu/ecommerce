package kfa.ecom.controller;
import kfa.ecom.dto.CartRequest;
import kfa.ecom.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final kfa.ecom.util.JwtUser jwtUser;

    @GetMapping
    public ResponseEntity<?> getCart() {
        return ResponseEntity.ok(cartService.getCart(jwtUser.getUserId()));
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody CartRequest req) {
        cartService.addItem(jwtUser.getUserId(), req);
        return ResponseEntity.ok("Product added to cart");
    }

    @PutMapping("/update")
    public ResponseEntity<?> update(@RequestBody CartRequest req) {
        cartService.updateQuantity(jwtUser.getUserId(), req);
        return ResponseEntity.ok("Cart updated");
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> remove(@PathVariable Long productId) {
        cartService.removeItem(jwtUser.getUserId(), productId);
        return ResponseEntity.ok("Product removed");
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clear() {
        cartService.clearCart(jwtUser.getUserId());
        return ResponseEntity.ok("Cart cleared");
    }

    @GetMapping("/count")
    public ResponseEntity<?> count() {
        return ResponseEntity.ok(cartService.countItems(jwtUser.getUserId()));
    }

}
