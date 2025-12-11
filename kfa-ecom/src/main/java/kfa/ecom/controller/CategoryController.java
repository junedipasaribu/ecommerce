package kfa.ecom.controller;

import kfa.ecom.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin
@RequiredArgsConstructor
public class CategoryController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        try {
            return ResponseEntity.ok(productService.getAllCategories());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error getting categories: " + e.getMessage());
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("Category controller is working!");
    }
    

    
    @PostMapping("/fix-sequence")
    public ResponseEntity<?> fixSequence() {
        try {
            productService.fixProductSequence();
            return ResponseEntity.ok("Product sequence fixed!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fixing sequence: " + e.getMessage());
        }
    }
    

    

}