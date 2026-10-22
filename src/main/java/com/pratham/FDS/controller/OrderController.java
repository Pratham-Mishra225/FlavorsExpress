package com.pratham.FDS.controller;

import com.pratham.FDS.dto.CheckoutRequest;
import com.pratham.FDS.dto.OrderDTO;
import com.pratham.FDS.dto.PagedResponse;
import com.pratham.FDS.enums.OrderStatus;
import com.pratham.FDS.service.OrderService;
import com.pratham.FDS.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order Controller", description = "Endpoints for placing and managing food delivery orders")
public class OrderController {

    private final OrderService orderService;
    private final SecurityUtils securityUtils;

    @PostMapping("/checkout")
    @Operation(summary = "Place a new order from cart", description = "Customer only. Derives customer identity server-side.")
    @ApiResponse(responseCode = "201", description = "Order placed successfully")
    public ResponseEntity<OrderDTO> checkout(@Valid @RequestBody CheckoutRequest request) {
        // Enforce customer ownership: derive customer identity server-side from JWT principal
        Long authenticatedCustomerId = securityUtils.getCurrentCustomer().getId();
        request.setCustomerId(authenticatedCustomerId);
        return new ResponseEntity<>(orderService.checkout(request), HttpStatus.CREATED);
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get paginated orders for authenticated customer",
               description = "Customer only. Identifies customer server-side from JWT.")
    public ResponseEntity<PagedResponse<OrderDTO>> getMyOrders(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "5") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction: asc or desc") @RequestParam(defaultValue = "desc") String sortDir) {
        Long authenticatedCustomerId = securityUtils.getCurrentCustomer().getId();
        return ResponseEntity.ok(orderService.getOrdersByCustomer(authenticatedCustomerId, page, size, sortBy, sortDir));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Verifies resource ownership or administrative privileges.")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get paginated orders for a customer",
               description = "Verifies caller owns customerId or is administrator.")
    public ResponseEntity<PagedResponse<OrderDTO>> getOrdersByCustomer(
            @PathVariable Long customerId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "5") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction: asc or desc") @RequestParam(defaultValue = "desc") String sortDir) {
        securityUtils.validateCustomerOwnership(customerId);
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId, page, size, sortBy, sortDir));
    }

    @GetMapping
    @Operation(summary = "Get all orders", description = "Admin only.")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get orders by status", description = "Admin only.")
    public ResponseEntity<List<OrderDTO>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }

    @PutMapping("/{id}/assign-automatic")
    @Operation(summary = "Auto-assign a delivery partner to an order", description = "Admin only.")
    public ResponseEntity<OrderDTO> assignDeliveryPartnerAutomatically(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.assignDeliveryPartnerAutomatically(id));
    }

    @PutMapping("/{id}/assign-manual/{partnerId}")
    @Operation(summary = "Manually assign a delivery partner to an order", description = "Admin only.")
    public ResponseEntity<OrderDTO> assignDeliveryPartnerManually(
            @PathVariable Long id,
            @PathVariable Long partnerId) {
        return ResponseEntity.ok(orderService.assignDeliveryPartnerManually(id, partnerId));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Admin only.")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @PutMapping("/{id}/delivery-status")
    @Operation(summary = "Delivery partner updates order status (server-derived partner)", description = "Delivery partner only.")
    public ResponseEntity<OrderDTO> updateMyDeliveryStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        var partner = securityUtils.getCurrentDeliveryPartner();
        return ResponseEntity.ok(orderService.updateDeliveryStatus(id, partner.getId(), status));
    }

    @PutMapping("/{id}/delivery-partner/me/status")
    @Operation(summary = "Delivery partner updates order status (server-derived partner identity)", description = "Delivery partner only. Identity always derived from JWT principal.")
    public ResponseEntity<OrderDTO> updateDeliveryStatusMe(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        var partner = securityUtils.getCurrentDeliveryPartner();
        return ResponseEntity.ok(orderService.updateDeliveryStatus(id, partner.getId(), status));
    }
}
