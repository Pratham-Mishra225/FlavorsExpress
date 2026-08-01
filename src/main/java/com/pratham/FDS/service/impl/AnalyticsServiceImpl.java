package com.pratham.FDS.service.impl;

import com.pratham.FDS.dto.AdminAnalyticsDTO;
import com.pratham.FDS.enums.DeliveryPartnerStatus;
import com.pratham.FDS.enums.OrderStatus;
import com.pratham.FDS.enums.UserRole;
import com.pratham.FDS.repository.CustomerRepository;
import com.pratham.FDS.repository.DeliveryPartnerRepository;
import com.pratham.FDS.repository.OrderRepository;
import com.pratham.FDS.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementation of {@link AnalyticsService}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;

    @Override
    public AdminAnalyticsDTO getAdminAnalytics() {
        log.info("Generating admin analytics report");

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);

        // Basic counts
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.sumTotalAmount();
        long ordersToday = orderRepository.countByCreatedAtBetween(startOfToday, endOfToday);
        BigDecimal revenueToday = orderRepository.sumTotalAmountToday(startOfToday, endOfToday);
        long totalCustomers = customerRepository.countByRole(UserRole.CUSTOMER);
        long activeDeliveryPartners = deliveryPartnerRepository.countByStatusNot(DeliveryPartnerStatus.OFFLINE);

        // Status Map
        Map<String, Long> statusMap = new HashMap<>();
        Arrays.stream(OrderStatus.values()).forEach(status -> {
            statusMap.put(status.name(), orderRepository.countByStatus(status));
        });

        // Top 5 selling menu items
        List<Object[]> queryResults = orderRepository.findTopSellingMenuItems(PageRequest.of(0, 5));
        List<AdminAnalyticsDTO.TopMenuItemDTO> topItems = queryResults.stream()
                .map(row -> new AdminAnalyticsDTO.TopMenuItemDTO(
                        (Long) row[0],
                        (String) row[1],
                        (Long) row[2]
                ))
                .collect(Collectors.toList());

        return AdminAnalyticsDTO.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .ordersToday(ordersToday)
                .revenueToday(revenueToday)
                .totalCustomers(totalCustomers)
                .activeDeliveryPartners(activeDeliveryPartners)
                .ordersByStatus(statusMap)
                .topMenuItems(topItems)
                .build();
    }
}
