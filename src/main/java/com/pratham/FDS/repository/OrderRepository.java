package com.pratham.FDS.repository;

import com.pratham.FDS.entity.Order;
import com.pratham.FDS.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByDeliveryPartnerId(Long deliveryPartnerId);
    List<Order> findByDeliveryPartnerIdAndStatus(Long deliveryPartnerId, OrderStatus status);
    
    long countByStatus(OrderStatus status);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deliveryPartner.id = :partnerId AND o.status NOT IN (com.pratham.FDS.enums.OrderStatus.DELIVERED, com.pratham.FDS.enums.OrderStatus.CANCELLED)")
    long countActiveDeliveriesByPartnerId(@Param("partnerId") Long partnerId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deliveryPartner.id = :partnerId AND o.id != :excludedOrderId AND o.status NOT IN (com.pratham.FDS.enums.OrderStatus.DELIVERED, com.pratham.FDS.enums.OrderStatus.CANCELLED)")
    long countActiveDeliveriesByPartnerIdExcludingOrder(@Param("partnerId") Long partnerId, @Param("excludedOrderId") Long excludedOrderId);

    @Query("SELECT o FROM Order o WHERE o.deliveryPartner.id = :partnerId AND o.status NOT IN (com.pratham.FDS.enums.OrderStatus.DELIVERED, com.pratham.FDS.enums.OrderStatus.CANCELLED)")
    List<Order> findActiveDeliveriesByPartnerId(@Param("partnerId") Long partnerId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal sumTotalAmount();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != 'CANCELLED' AND o.createdAt BETWEEN :start AND :end")
    BigDecimal sumTotalAmountToday(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT oi.menuItem.id, oi.menuItem.name, SUM(oi.quantity) " +
           "FROM OrderItem oi " +
           "GROUP BY oi.menuItem.id, oi.menuItem.name " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingMenuItems(Pageable pageable);
}
