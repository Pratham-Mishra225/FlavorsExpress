package com.pratham.FDS.mapper;

import com.pratham.FDS.dto.OrderDTO;
import com.pratham.FDS.entity.Customer;
import com.pratham.FDS.entity.DeliveryPartner;
import com.pratham.FDS.entity.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * Mapper for converting between {@link Order} entity and {@link OrderDTO}.
 * Manual mapping is used — no third-party mapping library.
 */
@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final OrderItemMapper orderItemMapper;

    /**
     * Converts an {@link Order} entity to an {@link OrderDTO}.
     *
     * @param order the entity to convert
     * @return the resulting DTO, or null if input is null
     */
    public OrderDTO toDTO(Order order) {
        if (order == null) {
            return null;
        }
        return OrderDTO.builder()
                .id(order.getId())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .deliveryPartnerId(order.getDeliveryPartner() != null ? order.getDeliveryPartner().getId() : null)
                .orderItems(order.getOrderItems() != null ?
                        order.getOrderItems().stream()
                                .map(orderItemMapper::toDTO)
                                .collect(Collectors.toList()) : new ArrayList<>())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .createdAt(order.getCreatedAt())
                .estimatedDeliveryTime(order.getEstimatedDeliveryTime())
                .promoCode(order.getPromoCode())
                .discountAmount(order.getDiscountAmount())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    /**
     * Converts an {@link OrderDTO} to an {@link Order} entity.
     *
     * @param dto             the DTO to convert
     * @param customer        the resolved Customer entity
     * @param deliveryPartner the resolved DeliveryPartner entity (can be null)
     * @return the resulting entity, or null if input is null
     */
    public Order toEntity(OrderDTO dto, Customer customer, DeliveryPartner deliveryPartner) {
        if (dto == null) {
            return null;
        }
        return Order.builder()
                .id(dto.getId())
                .customer(customer)
                .deliveryPartner(deliveryPartner)
                .totalAmount(dto.getTotalAmount())
                .discountAmount(dto.getDiscountAmount())
                .status(dto.getStatus())
                .paymentStatus(dto.getPaymentStatus())
                .deliveryAddress(dto.getDeliveryAddress())
                .promoCode(dto.getPromoCode())
                .estimatedDeliveryTime(dto.getEstimatedDeliveryTime())
                .orderItems(new ArrayList<>())
                .build();
    }
}
