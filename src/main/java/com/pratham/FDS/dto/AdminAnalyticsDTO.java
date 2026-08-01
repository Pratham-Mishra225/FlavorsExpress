package com.pratham.FDS.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTO for admin analytics dashboard — aggregates key restaurant KPIs.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAnalyticsDTO {

    private long totalOrders;
    private BigDecimal totalRevenue;
    private long ordersToday;
    private BigDecimal revenueToday;
    private long totalCustomers;
    private long activeDeliveryPartners;
    private Map<String, Long> ordersByStatus;
    private List<TopMenuItemDTO> topMenuItems;

    /**
     * Inner DTO for top-selling menu item summary.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopMenuItemDTO {
        private Long menuItemId;
        private String menuItemName;
        private Long totalQuantitySold;
    }
}
