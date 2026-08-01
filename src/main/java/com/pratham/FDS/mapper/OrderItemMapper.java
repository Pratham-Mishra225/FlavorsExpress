package com.pratham.FDS.mapper;

import com.pratham.FDS.dto.OrderItemDTO;
import com.pratham.FDS.entity.MenuItem;
import com.pratham.FDS.entity.Order;
import com.pratham.FDS.entity.OrderItem;
import org.springframework.stereotype.Component;

@Component
public class OrderItemMapper {

    public OrderItemDTO toDTO(OrderItem orderItem) {
        if (orderItem == null) {
            return null;
        }
        return OrderItemDTO.builder()
                .id(orderItem.getId())
                .menuItemId(orderItem.getMenuItem() != null ? orderItem.getMenuItem().getId() : null)
                .menuItemName(orderItem.getMenuItem() != null ? orderItem.getMenuItem().getName() : null)
                .quantity(orderItem.getQuantity())
                .price(orderItem.getPrice())
                .build();
    }

    public OrderItem toEntity(OrderItemDTO dto, Order order, MenuItem menuItem) {
        if (dto == null) {
            return null;
        }
        return OrderItem.builder()
                .id(dto.getId())
                .order(order)
                .menuItem(menuItem)
                .quantity(dto.getQuantity())
                .price(dto.getPrice())
                .build();
    }
}
