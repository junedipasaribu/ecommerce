package kfa.ecom.controller;

import kfa.ecom.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Controller untuk dashboard analytics dan statistics
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * ADMIN: Get dashboard overview statistics
     */
    @GetMapping("/overview")
    public ResponseEntity<?> getDashboardOverview(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        try {
            LocalDate from = fromDate != null ? LocalDate.parse(fromDate) : LocalDate.now().minusDays(30);
            LocalDate to = toDate != null ? LocalDate.parse(toDate) : LocalDate.now();
            
            return ResponseEntity.ok(dashboardService.getDashboardOverview(from, to));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error getting dashboard overview: " + e.getMessage());
        }
    }

    /**
     * ADMIN: Get revenue chart data
     */
    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueData(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "daily") String period) {
        try {
            LocalDate from = fromDate != null ? LocalDate.parse(fromDate) : LocalDate.now().minusDays(30);
            LocalDate to = toDate != null ? LocalDate.parse(toDate) : LocalDate.now();
            
            return ResponseEntity.ok(dashboardService.getRevenueData(from, to, period));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error getting revenue data: " + e.getMessage());
        }
    }

    /**
     * ADMIN: Get orders by status statistics
     */
    @GetMapping("/orders-by-status")
    public ResponseEntity<?> getOrdersByStatus(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        try {
            LocalDate from = fromDate != null ? LocalDate.parse(fromDate) : LocalDate.now().minusDays(30);
            LocalDate to = toDate != null ? LocalDate.parse(toDate) : LocalDate.now();
            
            return ResponseEntity.ok(dashboardService.getOrdersByStatus(from, to));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error getting orders by status: " + e.getMessage());
        }
    }

    /**
     * ADMIN: Get top products statistics
     */
    @GetMapping("/top-products")
    public ResponseEntity<?> getTopProducts(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            LocalDate from = fromDate != null ? LocalDate.parse(fromDate) : LocalDate.now().minusDays(30);
            LocalDate to = toDate != null ? LocalDate.parse(toDate) : LocalDate.now();
            
            return ResponseEntity.ok(dashboardService.getTopProducts(from, to, limit));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error getting top products: " + e.getMessage());
        }
    }

    /**
     * ADMIN: Get top categories statistics
     */
    @GetMapping("/top-categories")
    public ResponseEntity<?> getTopCategories(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            LocalDate from = fromDate != null ? LocalDate.parse(fromDate) : LocalDate.now().minusDays(30);
            LocalDate to = toDate != null ? LocalDate.parse(toDate) : LocalDate.now();
            
            return ResponseEntity.ok(dashboardService.getTopCategories(from, to, limit));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error getting top categories: " + e.getMessage());
        }
    }

    /**
     * ADMIN: Get recent orders
     */
    @GetMapping("/recent-orders")
    public ResponseEntity<?> getRecentOrders(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            return ResponseEntity.ok(dashboardService.getRecentOrders(limit));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error getting recent orders: " + e.getMessage());
        }
    }

    /**
     * ADMIN: Get complete dashboard data in one call
     */
    @GetMapping("/complete")
    public ResponseEntity<?> getCompleteDashboard(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        try {
            LocalDate from = fromDate != null ? LocalDate.parse(fromDate) : LocalDate.now().minusDays(30);
            LocalDate to = toDate != null ? LocalDate.parse(toDate) : LocalDate.now();
            
            return ResponseEntity.ok(dashboardService.getCompleteDashboard(from, to));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error getting complete dashboard: " + e.getMessage());
        }
    }


}