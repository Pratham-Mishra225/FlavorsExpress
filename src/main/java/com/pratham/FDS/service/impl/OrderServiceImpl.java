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

import com.pratham.FDS.security.SecurityUtils;

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
    private final SecurityUtils securityUtils;

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
        securityUtils.validateOrderAccess(order);
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
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        log.info("Fetching all orders");
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
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

        if (order.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
            throw new BadRequestException("Cannot assign delivery partner while order is already out for delivery");
        }

        if (order.getDeliveryPartner() != null) {
            throw new BadRequestException("Order is already assigned to a delivery partner");
        }

        // Deterministic, fair assignment query: status == AVAILABLE and activeDeliveries == 0
        // Sorted by least recently assigned first (nulls first, then lastAssignedAt asc, tie-breaker id asc)
        List<DeliveryPartner> eligiblePartners = deliveryPartnerRepository.findEligiblePartnersForAssignment();
        if (eligiblePartners.isEmpty()) {
            throw new BadRequestException("No available delivery partners at the moment. All partners are busy or offline.");
        }

        DeliveryPartner selectedPartner = null;
        for (DeliveryPartner candidate : eligiblePartners) {
            // Lock partner record for concurrency safety
            DeliveryPartner lockedPartner = deliveryPartnerRepository.findByIdWithLock(candidate.getId())
                    .orElse(null);
            if (lockedPartner != null
                    && lockedPartner.getStatus() == com.pratham.FDS.enums.DeliveryPartnerStatus.AVAILABLE
                    && orderRepository.countActiveDeliveriesByPartnerId(lockedPartner.getId()) == 0) {
                selectedPartner = lockedPartner;
                break;
            }
        }

        if (selectedPartner == null) {
            throw new BadRequestException("No available delivery partners at the moment. All eligible partners became busy.");
        }

        selectedPartner.setStatus(com.pratham.FDS.enums.DeliveryPartnerStatus.BUSY);
        selectedPartner.setLastAssignedAt(LocalDateTime.now());
        deliveryPartnerRepository.save(selectedPartner);

        order.setDeliveryPartner(selectedPartner);
        Order savedOrder = orderRepository.save(order);

        log.info("Order ID {} automatically assigned to delivery partner ID {} ({})",
                orderId, selectedPartner.getId(), selectedPartner.getName());
        return orderMapper.toDTO(savedOrder);
    }

    @Override
    public OrderDTO assignDeliveryPartnerManually(Long orderId, Long partnerId) {
        log.info("Manually assigning delivery partner {} to order {}", partnerId, orderId);
        Order order = findOrderOrThrow(orderId);

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot assign delivery partner to a delivered or cancelled order");
        }

        if (order.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
            throw new BadRequestException("Cannot reassign delivery partner while order is out for delivery");
        }

        DeliveryPartner partner = deliveryPartnerRepository.findByIdWithLock(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryPartner", "id", partnerId));

        // If partner is already assigned to this order, return existing state
        if (order.getDeliveryPartner() != null && order.getDeliveryPartner().getId().equals(partner.getId())) {
            return orderMapper.toDTO(order);
        }

        if (partner.getStatus() == com.pratham.FDS.enums.DeliveryPartnerStatus.OFFLINE) {
            throw new BadRequestException("Cannot assign an offline delivery partner");
        }

        if (partner.getStatus() == com.pratham.FDS.enums.DeliveryPartnerStatus.BUSY) {
            throw new BadRequestException("Cannot assign a delivery partner who is currently busy with another delivery");
        }

        // Validate partner has 0 active deliveries (max 1 active delivery rule)
        long partnerActiveDeliveries = orderRepository.countActiveDeliveriesByPartnerId(partner.getId());
        if (partnerActiveDeliveries > 0) {
            throw new BadRequestException("Cannot assign a delivery partner who already has an active delivery assignment");
        }

        // If the order already has a delivery partner, free up the previous partner first
        if (order.getDeliveryPartner() != null) {
            DeliveryPartner oldPartner = order.getDeliveryPartner();
            freeDeliveryPartner(oldPartner, order.getId());
        }

        partner.setStatus(com.pratham.FDS.enums.DeliveryPartnerStatus.BUSY);
        partner.setLastAssignedAt(LocalDateTime.now());
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

        validateStatusTransition(order, status);

        order.setStatus(status);

        // If transitioning to DELIVERED or CANCELLED, free up the partner if assigned
        if (status == OrderStatus.DELIVERED || status == OrderStatus.CANCELLED) {
            if (order.getDeliveryPartner() != null) {
                freeDeliveryPartner(order.getDeliveryPartner(), order.getId());
                log.info("Processed partner status for partner ID {} as order status is {}", order.getDeliveryPartner().getId(), status);
            }
        }

        Order savedOrder = orderRepository.save(order);
        return orderMapper.toDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByDeliveryPartner(Long deliveryPartnerId) {
        log.info("Fetching orders assigned to delivery partner ID: {}", deliveryPartnerId);
        return orderRepository.findByDeliveryPartnerId(deliveryPartnerId).stream()
                .map(orderMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTO updateDeliveryStatus(Long orderId, Long partnerId, OrderStatus status) {
        log.info("Delivery partner ID {} updating order ID {} status to {}", partnerId, orderId, status);
        Order order = findOrderOrThrow(orderId);

        // Security check: If authenticated user is a delivery partner, verify that partnerId matches caller
        if (securityUtils.isDeliveryPartner()) {
            DeliveryPartner currentPartner = securityUtils.getCurrentDeliveryPartner();
            if (!currentPartner.getId().equals(partnerId)) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Access denied: You cannot update delivery status for another partner."
                );
            }
        }

        if (order.getDeliveryPartner() == null || !order.getDeliveryPartner().getId().equals(partnerId)) {
            throw new BadRequestException("Order is not assigned to this delivery partner");
        }

        if (status != OrderStatus.OUT_FOR_DELIVERY && status != OrderStatus.DELIVERED) {
            throw new BadRequestException("Delivery partner can only update status to OUT_FOR_DELIVERY or DELIVERED");
        }

        validateStatusTransition(order, status);

        order.setStatus(status);

        if (status == OrderStatus.DELIVERED) {
            freeDeliveryPartner(order.getDeliveryPartner(), order.getId());
            log.info("Freed up delivery partner ID {} as order was successfully delivered", order.getDeliveryPartner().getId());
        }

        Order savedOrder = orderRepository.save(order);
        return orderMapper.toDTO(savedOrder);
    }

    /**
     * Enforces valid business state transitions across the order lifecycle:
     * PLACED -> PREPARING -> OUT_FOR_DELIVERY -> DELIVERED
     */
    private void validateStatusTransition(Order order, OrderStatus newStatus) {
        OrderStatus currentStatus = order.getStatus();

        if (currentStatus == newStatus) {
            return;
        }

        if (currentStatus == OrderStatus.DELIVERED) {
            throw new BadRequestException("Order #" + order.getId() + " is already DELIVERED and cannot be modified.");
        }

        if (currentStatus == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order #" + order.getId() + " is CANCELLED and cannot be modified.");
        }

        switch (currentStatus) {
            case PLACED -> {
                if (newStatus != OrderStatus.PREPARING && newStatus != OrderStatus.CANCELLED) {
                    throw new BadRequestException(
                            "Invalid status transition from " + currentStatus + " to " + newStatus +
                            ". A placed order must move to PREPARING first."
                    );
                }
            }
            case PREPARING -> {
                if (newStatus == OrderStatus.OUT_FOR_DELIVERY) {
                    if (order.getDeliveryPartner() == null) {
                        throw new BadRequestException("Cannot move order to OUT_FOR_DELIVERY without an assigned delivery partner.");
                    }
                } else if (newStatus != OrderStatus.READY && newStatus != OrderStatus.CANCELLED) {
                    throw new BadRequestException(
                            "Invalid status transition from " + currentStatus + " to " + newStatus +
                            ". A preparing order can only transition to READY, OUT_FOR_DELIVERY, or CANCELLED."
                    );
                }
            }
            case READY -> {
                if (newStatus == OrderStatus.OUT_FOR_DELIVERY) {
                    if (order.getDeliveryPartner() == null) {
                        throw new BadRequestException("Cannot move order to OUT_FOR_DELIVERY without an assigned delivery partner.");
                    }
                } else if (newStatus != OrderStatus.CANCELLED) {
                    throw new BadRequestException(
                            "Invalid status transition from " + currentStatus + " to " + newStatus +
                            ". A ready order can only transition to OUT_FOR_DELIVERY or CANCELLED."
                    );
                }
            }
            case OUT_FOR_DELIVERY -> {
                if (newStatus != OrderStatus.DELIVERED) {
                    throw new BadRequestException(
                            "Invalid status transition from " + currentStatus + " to " + newStatus +
                            ". An order out for delivery can only transition to DELIVERED."
                    );
                }
            }
            default -> throw new BadRequestException("Unsupported status transition from " + currentStatus + " to " + newStatus);
        }
    }

    // Helper methods to reduce code duplication
    private Order findOrderOrThrow(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    private void freeDeliveryPartner(DeliveryPartner partner, Long currentOrderId) {
        if (partner == null) {
            return;
        }
        long remainingActive = (currentOrderId != null)
                ? orderRepository.countActiveDeliveriesByPartnerIdExcludingOrder(partner.getId(), currentOrderId)
                : orderRepository.countActiveDeliveriesByPartnerId(partner.getId());

        if (remainingActive == 0) {
            if (partner.getStatus() != com.pratham.FDS.enums.DeliveryPartnerStatus.OFFLINE) {
                partner.setStatus(com.pratham.FDS.enums.DeliveryPartnerStatus.AVAILABLE);
                deliveryPartnerRepository.save(partner);
            }
        } else {
            partner.setStatus(com.pratham.FDS.enums.DeliveryPartnerStatus.BUSY);
            deliveryPartnerRepository.save(partner);
        }
    }

    private void freeDeliveryPartner(DeliveryPartner partner) {
        freeDeliveryPartner(partner, null);
    }
}
