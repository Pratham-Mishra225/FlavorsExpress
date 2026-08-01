package com.pratham.FDS.service.impl;

import com.pratham.FDS.dto.CheckoutRequest;
import com.pratham.FDS.dto.OrderDTO;
import com.pratham.FDS.dto.PagedResponse;
import com.pratham.FDS.entity.*;
import com.pratham.FDS.enums.OrderStatus;
import com.pratham.FDS.enums.PaymentStatus;
import com.pratham.FDS.exception.BadRequestException;
import com.pratham.FDS.exception.ResourceNotFoundException;
import com.pratham.FDS.mapper.OrderMapper;
import com.pratham.FDS.repository.*;
import com.pratham.FDS.service.OrderService;
import com.pratham.FDS.service.PromoCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerRepository customerRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final OrderMapper orderMapper;
    private final PromoCodeService promoCodeService;

    @Override
    public OrderDTO checkout(CheckoutRequest request) {
        log.info("Processing checkout for customer ID: {}", request.getCustomerId());

        // Step 1: Validate customer exists
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        // Step 2: Fetch cart, throw BadRequestException if cart is empty
        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException("No cart found for customer"));

        List<CartItem> cartItems = cart.getCartItems();
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty. Cannot checkout.");
        }

        // Step 3 & 4: Validate MenuItem availability and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        int maxPrepTime = 15;
        for (CartItem cartItem : cartItems) {
            MenuItem menuItem = cartItem.getMenuItem();
            if (!menuItem.getIsAvailable()) {
                throw new BadRequestException("Menu item '" + menuItem.getName() + "' is currently unavailable.");
            }
            totalAmount = totalAmount.add(menuItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            if (menuItem.getPreparationTimeMinutes() != null && menuItem.getPreparationTimeMinutes() > maxPrepTime) {
                maxPrepTime = menuItem.getPreparationTimeMinutes();
            }
        }

        // Calculate discount amount from promo code
        BigDecimal discountAmount = BigDecimal.ZERO;
        String appliedPromo = null;
        if (request.getPromoCode() != null && !request.getPromoCode().trim().isEmpty()) {
            appliedPromo = request.getPromoCode().trim();
            discountAmount = promoCodeService.applyPromoCode(appliedPromo, totalAmount);
        }

        BigDecimal finalTotal = totalAmount.subtract(discountAmount);
        if (finalTotal.compareTo(BigDecimal.ZERO) <= 0) {
            finalTotal = BigDecimal.valueOf(0.01); // Satisfy positive totalAmount requirement
        }

        // Calculate estimated delivery time: max preparation time + 20 minutes buffer
        LocalDateTime estimatedDeliveryTime = LocalDateTime.now().plusMinutes(maxPrepTime + 20);

        // Step 5: Create & save Order
        Order order = Order.builder()
                .customer(customer)
                .deliveryAddress(request.getDeliveryAddress())
                .totalAmount(finalTotal)
                .discountAmount(discountAmount)
                .promoCode(appliedPromo)
                .estimatedDeliveryTime(estimatedDeliveryTime)
                .status(OrderStatus.PLACED)
                .paymentStatus(PaymentStatus.PENDING)
                .build();
        
        Order savedOrder = orderRepository.save(order);

        // Step 6: Create & save OrderItems
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .menuItem(cartItem.getMenuItem())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getMenuItem().getPrice())
                    .build();
            orderItemRepository.save(orderItem);
            savedOrder.getOrderItems().add(orderItem);
        }

        // Step 7: Clear all CartItems
        cartItemRepository.deleteAll(cartItems);
        cart.getCartItems().clear();

        log.info("Checkout successful. Order ID {} created with final amount {} (discount {})", 
                savedOrder.getId(), finalTotal, discountAmount);

        // Step 8: Return OrderDTO
        return orderMapper.toDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id) {
        log.info("Fetching order by ID: {}", id);
        Order order = findOrderOrThrow(id);
        return orderMapper.toDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByCustomer(Long customerId) {
        log.info("Fetching orders for customer ID: {}", customerId);
        customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));

        return orderRepository.findByCustomerId(customerId).stream()
                .map(orderMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderDTO> getOrdersByCustomer(Long customerId, int page, int size, String sortBy, String sortDir) {
        log.info("Fetching paginated orders for customer ID: {}", customerId);
        customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Order> ordersPage = orderRepository.findByCustomerId(customerId, pageable);

        List<OrderDTO> content = ordersPage.getContent().stream()
                .map(orderMapper::toDTO)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                ordersPage.getNumber(),
                ordersPage.getSize(),
                ordersPage.getTotalElements(),
                ordersPage.getTotalPages(),
                ordersPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByStatus(OrderStatus status) {
        log.info("Fetching orders by status: {}", status);
        return orderRepository.findByStatus(status).stream()
                .map(orderMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTO assignDeliveryPartnerAutomatically(Long orderId) {
        log.info("Automatically assigning delivery partner to order ID: {}", orderId);
        Order order = findOrderOrThrow(orderId);

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot assign delivery partner to a delivered or cancelled order");
        }

        if (order.getDeliveryPartner() != null) {
            throw new BadRequestException("Order is already assigned to a delivery partner");
        }

        // Find available partners
        List<DeliveryPartner> availablePartners = deliveryPartnerRepository.findByStatus(com.pratham.FDS.enums.DeliveryPartnerStatus.AVAILABLE);
        if (availablePartners.isEmpty()) {
            throw new BadRequestException("No available delivery partners at the moment");
        }

        DeliveryPartner partner = availablePartners.get(0);
        partner.setStatus(com.pratham.FDS.enums.DeliveryPartnerStatus.BUSY);
        deliveryPartnerRepository.save(partner);

        order.setDeliveryPartner(partner);
        Order savedOrder = orderRepository.save(order);

        log.info("Order ID {} automatically assigned to delivery partner ID {}", orderId, partner.getId());
        return orderMapper.toDTO(savedOrder);
    }

    @Override
    public OrderDTO assignDeliveryPartnerManually(Long orderId, Long partnerId) {
        log.info("Manually assigning delivery partner {} to order {}", partnerId, orderId);
        Order order = findOrderOrThrow(orderId);

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot assign delivery partner to a delivered or cancelled order");
        }

        DeliveryPartner partner = deliveryPartnerRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryPartner", "id", partnerId));

        if (partner.getStatus() == com.pratham.FDS.enums.DeliveryPartnerStatus.OFFLINE) {
            throw new BadRequestException("Cannot assign an offline delivery partner");
        }

        // If the order already has a delivery partner, free up the previous partner first
        if (order.getDeliveryPartner() != null) {
            DeliveryPartner oldPartner = order.getDeliveryPartner();
            if (!oldPartner.getId().equals(partner.getId())) {
                freeDeliveryPartner(oldPartner);
            }
        }

        partner.setStatus(com.pratham.FDS.enums.DeliveryPartnerStatus.BUSY);
        deliveryPartnerRepository.save(partner);

        order.setDeliveryPartner(partner);
        Order savedOrder = orderRepository.save(order);

        log.info("Order ID {} manually assigned to delivery partner ID {}", orderId, partner.getId());
        return orderMapper.toDTO(savedOrder);
    }

    @Override
    public OrderDTO updateOrderStatus(Long orderId, OrderStatus status) {
        log.info("Updating order ID {} status to {}", orderId, status);
        Order order = findOrderOrThrow(orderId);

        order.setStatus(status);

        // If transitioning to DELIVERED or CANCELLED, free up the partner if assigned
        if (status == OrderStatus.DELIVERED || status == OrderStatus.CANCELLED) {
            if (order.getDeliveryPartner() != null) {
                freeDeliveryPartner(order.getDeliveryPartner());
                log.info("Freed up delivery partner ID {} as order status is {}", order.getDeliveryPartner().getId(), status);
            }
        }

        Order savedOrder = orderRepository.save(order);
        return orderMapper.toDTO(savedOrder);
    }

    @Override
    public OrderDTO updateDeliveryStatus(Long orderId, Long partnerId, OrderStatus status) {
        log.info("Delivery partner ID {} updating order ID {} status to {}", partnerId, orderId, status);
        Order order = findOrderOrThrow(orderId);

        if (order.getDeliveryPartner() == null || !order.getDeliveryPartner().getId().equals(partnerId)) {
            throw new BadRequestException("Order is not assigned to this delivery partner");
        }

        if (status != OrderStatus.OUT_FOR_DELIVERY && status != OrderStatus.DELIVERED) {
            throw new BadRequestException("Delivery partner can only update status to OUT_FOR_DELIVERY or DELIVERED");
        }

        order.setStatus(status);

        if (status == OrderStatus.DELIVERED) {
            freeDeliveryPartner(order.getDeliveryPartner());
            log.info("Freed up delivery partner ID {} as order was successfully delivered", order.getDeliveryPartner().getId());
        }

        Order savedOrder = orderRepository.save(order);
        return orderMapper.toDTO(savedOrder);
    }

    // Helper methods to reduce code duplication
    private Order findOrderOrThrow(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    private void freeDeliveryPartner(DeliveryPartner partner) {
        if (partner != null) {
            partner.setStatus(com.pratham.FDS.enums.DeliveryPartnerStatus.AVAILABLE);
            deliveryPartnerRepository.save(partner);
        }
    }
}
