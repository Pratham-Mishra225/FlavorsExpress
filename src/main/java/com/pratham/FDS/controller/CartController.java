package com.pratham.FDS.controller;

import com.pratham.FDS.dto.CartDTO;
import com.pratham.FDS.dto.CartItemRequest;
import com.pratham.FDS.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // GET /api/cart/{customerId} — Get cart with items and subtotal
    @GetMapping("/{customerId}")
    public ResponseEntity<CartDTO> getCart(@PathVariable Long customerId) {
        return ResponseEntity.ok(cartService.getCart(customerId));
    }

    // POST /api/cart/{customerId}/items — Add item (or increment if already exists)
    @PostMapping("/{customerId}/items")
    public ResponseEntity<CartDTO> addItem(
            @PathVariable Long customerId,
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(customerId, request));
    }

    // PUT /api/cart/{customerId}/items/{cartItemId} — Update quantity of a specific item
    @PutMapping("/{customerId}/items/{cartItemId}")
    public ResponseEntity<CartDTO> updateItemQuantity(
            @PathVariable Long customerId,
            @PathVariable Long cartItemId,
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.updateItemQuantity(customerId, cartItemId, request));
    }

    // DELETE /api/cart/{customerId}/items/{cartItemId} — Remove a single item
    @DeleteMapping("/{customerId}/items/{cartItemId}")
    public ResponseEntity<CartDTO> removeItem(
            @PathVariable Long customerId,
            @PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeItem(customerId, cartItemId));
    }

    // DELETE /api/cart/{customerId} — Clear the entire cart
    @DeleteMapping("/{customerId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long customerId) {
        cartService.clearCart(customerId);
        return ResponseEntity.noContent().build();
    }
}
