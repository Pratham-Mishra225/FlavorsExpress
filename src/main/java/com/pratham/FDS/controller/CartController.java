package com.pratham.FDS.controller;

import com.pratham.FDS.dto.CartDTO;
import com.pratham.FDS.dto.CartItemRequest;
import com.pratham.FDS.service.CartService;
import com.pratham.FDS.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final SecurityUtils securityUtils;

    // GET /api/cart/my-cart — Get own cart directly from authenticated principal
    @GetMapping("/my-cart")
    public ResponseEntity<CartDTO> getMyCart() {
        Long currentCustomerId = securityUtils.getCurrentCustomer().getId();
        return ResponseEntity.ok(cartService.getCart(currentCustomerId));
    }

    // GET /api/cart/{customerId} — Get cart with items and subtotal (verifying caller owns customerId)
    @GetMapping("/{customerId}")
    public ResponseEntity<CartDTO> getCart(@PathVariable Long customerId) {
        securityUtils.validateCustomerOwnership(customerId);
        return ResponseEntity.ok(cartService.getCart(customerId));
    }

    // POST /api/cart/{customerId}/items — Add item (or increment if already exists)
    @PostMapping("/{customerId}/items")
    public ResponseEntity<CartDTO> addItem(
            @PathVariable Long customerId,
            @Valid @RequestBody CartItemRequest request) {
        securityUtils.validateCustomerOwnership(customerId);
        return ResponseEntity.ok(cartService.addItem(customerId, request));
    }

    // PUT /api/cart/{customerId}/items/{cartItemId} — Update quantity of a specific item
    @PutMapping("/{customerId}/items/{cartItemId}")
    public ResponseEntity<CartDTO> updateItemQuantity(
            @PathVariable Long customerId,
            @PathVariable Long cartItemId,
            @Valid @RequestBody CartItemRequest request) {
        securityUtils.validateCustomerOwnership(customerId);
        return ResponseEntity.ok(cartService.updateItemQuantity(customerId, cartItemId, request));
    }

    // DELETE /api/cart/{customerId}/items/{cartItemId} — Remove a single item
    @DeleteMapping("/{customerId}/items/{cartItemId}")
    public ResponseEntity<CartDTO> removeItem(
            @PathVariable Long customerId,
            @PathVariable Long cartItemId) {
        securityUtils.validateCustomerOwnership(customerId);
        return ResponseEntity.ok(cartService.removeItem(customerId, cartItemId));
    }

    // DELETE /api/cart/{customerId} — Clear the entire cart
    @DeleteMapping("/{customerId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long customerId) {
        securityUtils.validateCustomerOwnership(customerId);
        cartService.clearCart(customerId);
        return ResponseEntity.noContent().build();
    }
}
