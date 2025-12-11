package kfa.ecom.service;

import kfa.ecom.dto.DashboardOverviewResponse;
import kfa.ecom.entity.Order;
import kfa.ecom.entity.OrderItem;
import kfa.ecom.repository.OrderItemRepository;
import kfa.ecom.repository.OrderRepository;
import kfa.ecom.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    /**
     * Get complete dashboard overview
     */
    public DashboardOverviewResponse getDashboardOverview(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();

        // Get orders in date range
        List<Order> orders = orderRepository.findByCreatedAtBetween(from, to);
        List<Order> allOrders = orderRepository.findAll();

        // Calculate statistics
        DashboardOverviewResponse.StatCard totalRevenue = calculateTotalRevenue(orders, allOrders, from, to);
        DashboardOverviewResponse.StatCard totalOrders = calculateTotalOrders(orders, allOrders, from, to);
        DashboardOverviewResponse.StatCard totalProducts = calculateTotalProducts();

        // Get detailed data
        List<DashboardOverviewResponse.OrderStatusCount> ordersByStatus = getOrdersByStatus(fromDate, toDate);
        List<DashboardOverviewResponse.RevenueData> revenueChart = getRevenueData(fromDate, toDate, "daily");
        List<DashboardOverviewResponse.TopProductData> topProducts = getTopProducts(fromDate, toDate, 10);
        List<DashboardOverviewResponse.TopCategoryData> topCategories = getTopCategories(fromDate, toDate, 5);
        List<DashboardOverviewResponse.RecentOrderData> recentOrders = getRecentOrders(10);

        return DashboardOverviewResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .ordersByStatus(ordersByStatus)
                .revenueChart(revenueChart)
                .topProducts(topProducts)
                .topCategories(topCategories)
                .recentOrders(recentOrders)
                .build();
    }

    /**
     * Calculate total revenue with trend
     */
    private DashboardOverviewResponse.StatCard calculateTotalRevenue(List<Order> currentOrders, List<Order> allOrders, LocalDateTime from, LocalDateTime to) {
        // Current period revenue
        double currentRevenue = currentOrders.stream()
                .filter(order -> !order.getStatus().startsWith("CANCELLED") && !order.getStatus().equals("EXPIRED"))
                .mapToDouble(Order::getTotalAmount)
                .sum();

        // Previous period for comparison
        long daysDiff = java.time.Duration.between(from, to).toDays();
        LocalDateTime prevFrom = from.minusDays(daysDiff);
        LocalDateTime prevTo = from;

        double previousRevenue = allOrders.stream()
                .filter(order -> order.getCreatedAt().isAfter(prevFrom) && order.getCreatedAt().isBefore(prevTo))
                .filter(order -> !order.getStatus().startsWith("CANCELLED") && !order.getStatus().equals("EXPIRED"))
                .mapToDouble(Order::getTotalAmount)
                .sum();

        // Calculate trend
        String trend = "stable";
        String trendValue = "0%";
        if (previousRevenue > 0) {
            double changePercent = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
            trend = changePercent > 0 ? "up" : changePercent < 0 ? "down" : "stable";
            trendValue = String.format("%.1f%%", Math.abs(changePercent));
        }

        return DashboardOverviewResponse.StatCard.builder()
                .title("Total Revenue")
                .value(String.format("Rp %.0f", currentRevenue))
                .subtitle(String.format("From %s to %s", from.toLocalDate(), to.toLocalDate().minusDays(1)))
                .trend(trend)
                .trendValue(trendValue)
                .build();
    }

    /**
     * Calculate total orders with trend
     */
    private DashboardOverviewResponse.StatCard calculateTotalOrders(List<Order> currentOrders, List<Order> allOrders, LocalDateTime from, LocalDateTime to) {
        long currentCount = currentOrders.size();

        // Previous period for comparison
        long daysDiff = java.time.Duration.between(from, to).toDays();
        LocalDateTime prevFrom = from.minusDays(daysDiff);
        LocalDateTime prevTo = from;

        long previousCount = allOrders.stream()
                .filter(order -> order.getCreatedAt().isAfter(prevFrom) && order.getCreatedAt().isBefore(prevTo))
                .count();

        // Calculate trend
        String trend = "stable";
        String trendValue = "0%";
        if (previousCount > 0) {
            double changePercent = ((double)(currentCount - previousCount) / previousCount) * 100;
            trend = changePercent > 0 ? "up" : changePercent < 0 ? "down" : "stable";
            trendValue = String.format("%.1f%%", Math.abs(changePercent));
        }

        return DashboardOverviewResponse.StatCard.builder()
                .title("Total Orders")
                .value(String.valueOf(currentCount))
                .subtitle("Orders in selected period")
                .trend(trend)
                .trendValue(trendValue)
                .build();
    }

    /**
     * Calculate total products
     */
    private DashboardOverviewResponse.StatCard calculateTotalProducts() {
        long totalProducts = productRepository.count();
        long lowStockProducts = productRepository.countByStockLessThan(10);

        return DashboardOverviewResponse.StatCard.builder()
                .title("Total Products")
                .value(String.valueOf(totalProducts))
                .subtitle(String.format("%d products low stock", lowStockProducts))
                .trend("stable")
                .trendValue("0%")
                .build();
    }

    /**
     * Get orders grouped by status
     */
    public List<DashboardOverviewResponse.OrderStatusCount> getOrdersByStatus(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();

        List<Order> orders = orderRepository.findByCreatedAtBetween(from, to);
        long totalOrders = orders.size();

        Map<String, Long> statusCounts = orders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));

        return statusCounts.entrySet().stream()
                .map(entry -> {
                    String percentage = totalOrders > 0 ? 
                        String.format("%.1f%%", (entry.getValue() * 100.0) / totalOrders) : "0%";
                    
                    return DashboardOverviewResponse.OrderStatusCount.builder()
                            .status(entry.getKey())
                            .count(entry.getValue())
                            .percentage(percentage)
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .collect(Collectors.toList());
    }

    /**
     * Get revenue data for chart
     */
    public List<DashboardOverviewResponse.RevenueData> getRevenueData(LocalDate fromDate, LocalDate toDate, String period) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();

        List<Order> orders = orderRepository.findByCreatedAtBetween(from, to)
                .stream()
                .filter(order -> !order.getStatus().startsWith("CANCELLED") && !order.getStatus().equals("EXPIRED"))
                .collect(Collectors.toList());

        Map<String, List<Order>> groupedOrders;
        DateTimeFormatter formatter;

        if ("monthly".equals(period)) {
            formatter = DateTimeFormatter.ofPattern("yyyy-MM");
            groupedOrders = orders.stream()
                    .collect(Collectors.groupingBy(order -> 
                        order.getCreatedAt().format(formatter)));
        } else {
            formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            groupedOrders = orders.stream()
                    .collect(Collectors.groupingBy(order -> 
                        order.getCreatedAt().format(formatter)));
        }

        return groupedOrders.entrySet().stream()
                .map(entry -> {
                    double revenue = entry.getValue().stream()
                            .mapToDouble(Order::getTotalAmount)
                            .sum();
                    
                    return DashboardOverviewResponse.RevenueData.builder()
                            .date(entry.getKey())
                            .revenue(revenue)
                            .orderCount((long) entry.getValue().size())
                            .build();
                })
                .sorted(Comparator.comparing(DashboardOverviewResponse.RevenueData::getDate))
                .collect(Collectors.toList());
    }

    /**
     * Get top products by quantity sold
     */
    public List<DashboardOverviewResponse.TopProductData> getTopProducts(LocalDate fromDate, LocalDate toDate, int limit) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();

        List<Order> orders = orderRepository.findByCreatedAtBetween(from, to)
                .stream()
                .filter(order -> !order.getStatus().startsWith("CANCELLED") && !order.getStatus().equals("EXPIRED"))
                .collect(Collectors.toList());

        Map<String, DashboardOverviewResponse.TopProductData> productStats = new HashMap<>();

        for (Order order : orders) {
            List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
            for (OrderItem item : orderItems) {
                String productName = item.getProduct().getName();
                String category = item.getProduct().getCategory() != null ? 
                    item.getProduct().getCategory().getName() : "Uncategorized";
                
                productStats.merge(productName, 
                    DashboardOverviewResponse.TopProductData.builder()
                            .productName(productName)
                            .quantity((long) item.getQuantity())
                            .revenue(item.getPrice() * item.getQuantity())
                            .category(category)
                            .build(),
                    (existing, replacement) -> DashboardOverviewResponse.TopProductData.builder()
                            .productName(productName)
                            .quantity(existing.getQuantity() + replacement.getQuantity())
                            .revenue(existing.getRevenue() + replacement.getRevenue())
                            .category(category)
                            .build()
                );
            }
        }

        return productStats.values().stream()
                .sorted((a, b) -> Long.compare(b.getQuantity(), a.getQuantity()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get top categories by revenue
     */
    public List<DashboardOverviewResponse.TopCategoryData> getTopCategories(LocalDate fromDate, LocalDate toDate, int limit) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();

        List<Order> orders = orderRepository.findByCreatedAtBetween(from, to)
                .stream()
                .filter(order -> !order.getStatus().startsWith("CANCELLED") && !order.getStatus().equals("EXPIRED"))
                .collect(Collectors.toList());

        Map<String, DashboardOverviewResponse.TopCategoryData> categoryStats = new HashMap<>();
        double totalRevenue = 0;

        for (Order order : orders) {
            List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
            for (OrderItem item : orderItems) {
                String category = item.getProduct().getCategory() != null ? 
                    item.getProduct().getCategory().getName() : "Uncategorized";
                double itemRevenue = item.getPrice() * item.getQuantity();
                totalRevenue += itemRevenue;
                
                categoryStats.merge(category,
                    DashboardOverviewResponse.TopCategoryData.builder()
                            .categoryName(category)
                            .quantity((long) item.getQuantity())
                            .revenue(itemRevenue)
                            .build(),
                    (existing, replacement) -> DashboardOverviewResponse.TopCategoryData.builder()
                            .categoryName(category)
                            .quantity(existing.getQuantity() + replacement.getQuantity())
                            .revenue(existing.getRevenue() + replacement.getRevenue())
                            .build()
                );
            }
        }

        final double finalTotalRevenue = totalRevenue;
        return categoryStats.values().stream()
                .map(category -> DashboardOverviewResponse.TopCategoryData.builder()
                        .categoryName(category.getCategoryName())
                        .quantity(category.getQuantity())
                        .revenue(category.getRevenue())
                        .percentage(finalTotalRevenue > 0 ? 
                            String.format("%.1f%%", (category.getRevenue() / finalTotalRevenue) * 100) : "0%")
                        .build())
                .sorted((a, b) -> Double.compare(b.getRevenue(), a.getRevenue()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get recent orders
     */
    public List<DashboardOverviewResponse.RecentOrderData> getRecentOrders(int limit) {
        List<Order> orders = orderRepository.findTop10ByOrderByCreatedAtDesc();
        
        return orders.stream()
                .limit(limit)
                .map(order -> DashboardOverviewResponse.RecentOrderData.builder()
                        .orderId(order.getId())
                        .orderCode(order.getOrderCode())
                        .customerName(order.getUser().getName())
                        .status(order.getStatus())
                        .total(order.getTotalAmount())
                        .date(order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                        .time(order.getCreatedAt().format(DateTimeFormatter.ofPattern("HH:mm")))
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Get complete dashboard data in one call
     */
    public Map<String, Object> getCompleteDashboard(LocalDate fromDate, LocalDate toDate) {
        DashboardOverviewResponse overview = getDashboardOverview(fromDate, toDate);
        
        Map<String, Object> result = new HashMap<>();
        result.put("overview", overview);
        result.put("dateRange", Map.of(
            "from", fromDate.toString(),
            "to", toDate.toString()
        ));
        result.put("lastUpdated", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        return result;
    }
}