package com.pratham.FDS.repository;

import com.pratham.FDS.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @org.springframework.data.jpa.repository.Query("""
        SELECT oi.menuItem.id, oi.menuItem.name, SUM(oi.quantity)
        FROM OrderItem oi
        GROUP BY oi.menuItem.id, oi.menuItem.name
        ORDER BY SUM(oi.quantity) DESC
    """)
    List<Object[]> findTopSellingMenuItems(org.springframework.data.domain.Pageable pageable);
}
