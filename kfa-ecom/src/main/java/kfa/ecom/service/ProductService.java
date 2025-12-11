package kfa.ecom.service;

import kfa.ecom.dto.ProductRequest;
import kfa.ecom.dto.ProductResponse;
import kfa.ecom.entity.Category;
import kfa.ecom.entity.Product;
import kfa.ecom.repository.CategoryRepository;
import kfa.ecom.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // 🔹 GET ALL PRODUCTS
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream().map(
                p -> ProductResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .description(p.getDescription())
                        .price(p.getPrice())
                        .stock(p.getStock())
                        .imageUrl(p.getImageUrl())
                        .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                        .build()
        ).toList();
    }

    // 🔹 GET PRODUCT BY ID
    public ProductResponse getProductById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .stock(p.getStock())
                .imageUrl(p.getImageUrl())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .build();
    }

    // 🔹 CREATE PRODUCT
    public ProductResponse createProduct(ProductRequest req) {
        Category category = null;
        if (req.getCategoryId() != null) {
            category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with ID: " + req.getCategoryId()));
        }

        Product product = new Product();
        product.setName(req.getName());
        product.setDescription(req.getDescription());
        product.setPrice(req.getPrice());
        product.setStock(req.getStock());
        product.setImageUrl(req.getImageUrl());
        product.setCategory(category);

        Product saved = productRepository.save(product);
        return getProductById(saved.getId());
    }

    // 🔹 UPDATE PRODUCT
    public ProductResponse updateProduct(Long id, ProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setName(req.getName());
        product.setDescription(req.getDescription());
        product.setPrice(req.getPrice());
        product.setStock(req.getStock());
        product.setImageUrl(req.getImageUrl());
        product.setCategory(category);

        productRepository.save(product);
        return getProductById(product.getId());
    }

    // 🔹 DELETE PRODUCT
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(id);
    }
    
    // 🔹 GET ALL CATEGORIES
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    // 🔹 FIX PRODUCT SEQUENCE
    @Transactional
    public void fixProductSequence() {
        // Set sequence to a high value (1000) to avoid conflicts
        productRepository.resetSequence();
    }
    

}
