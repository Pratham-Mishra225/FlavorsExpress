package com.pratham.FDS.service;

import com.pratham.FDS.dto.CartDTO;
import com.pratham.FDS.dto.CartItemRequest;

public interface CartService {

    CartDTO getCart(Long customerId);

    CartDTO addItem(Long customerId, CartItemRequest request);

    CartDTO updateItemQuantity(Long customerId, Long cartItemId, CartItemRequest request);

    CartDTO removeItem(Long customerId, Long cartItemId);

    void clearCart(Long customerId);
}
