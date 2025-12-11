package kfa.ecom.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardOverviewResponse {
    private StatCard totalRevenue;
    private StatCard totalOrders;
    private StatCard totalProducts;
    private List<OrderStatusCount> ordersByStatus;
    private List<RevenueData> revenueChart;
    private List<TopProductData> topProducts;
    private List<TopCategoryData> topCategories;
    private List<RecentOrderData> recentOrders;

    @Data
    @Builder
    public static class StatCard {
        private String title;
        private String value;
        private String subtitle;
        private String trend; // "up", "down", "stable"
        private String trendValue; // percentage change
    }

    @Data
    @Builder
    public static class OrderStatusCount {
        private String status;
        private Long count;
        private String percentage;
    }

    @Data
    @Builder
    public static class RevenueData {
        private String date;
        private Double revenue;
        private Long orderCount;
    }

    @Data
    @Builder
    public static class TopProductData {
        private String productName;
        private Long quantity;
        private Double revenue;
        private String category;
    }

    @Data
    @Builder
    public static class TopCategoryData {
        private String categoryName;
        private Long quantity;
        private Double revenue;
        private String percentage;
    }

    @Data
    @Builder
    public static class RecentOrderData {
        private Long orderId;
        private String orderCode;
        private String customerName;
        private String status;
        private Double total;
        private String date;
        private String time;
    }
}