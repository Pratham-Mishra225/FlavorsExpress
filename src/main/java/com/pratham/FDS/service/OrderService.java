package com.pratham.FDS.service;

import com.pratham.FDS.dto.CheckoutRequest;
import com.pratham.FDS.dto.OrderDTO;
import com.pratham.FDS.enums.OrderStatus;

import java.util.List;

public interface OrderService {

    OrderDTO checkout(CheckoutRequest request);

    OrderDTO getOrderById(Long id);

    List<OrderDTO> getOrdersByCustomer(Long customerId);

    com.pratham.FDS.dto.PagedResponse<OrderDTO> getOrdersByCustomer(Long customerId, int page, int size, String sortBy, String sortDir);

    List<OrderDTO> getOrdersByStatus(OrderStatus status);

    OrderDTO assignDeliveryPartnerAutomatically(Long orderId);

    OrderDTO assignDeliveryPartnerManually(Long orderId, Long partnerId);

    OrderDTO updateOrderStatus(Long orderId, OrderStatus status);

    OrderDTO updateDeliveryStatus(Long orderId, Long partnerId, OrderStatus status);
}
