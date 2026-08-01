package com.pratham.FDS.mapper;

import com.pratham.FDS.dto.CartDTO;
import com.pratham.FDS.entity.Cart;
import com.pratham.FDS.entity.Customer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CartMapper {

    private final CartItemMapper cartItemMapper;

    public CartDTO toDTO(Cart cart) {
        if (cart == null) {
            return null;
        }
        return CartDTO.builder()
                .id(cart.getId())
                .customerId(cart.getCustomer() != null ? cart.getCustomer().getId() : null)
                .cartItems(cart.getCartItems() != null ?
                        cart.getCartItems().stream()
                                .map(cartItemMapper::toDTO)
                                .collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }

    public Cart toEntity(CartDTO dto, Customer customer) {
        if (dto == null) {
            return null;
        }
        return Cart.builder()
                .id(dto.getId())
                .customer(customer)
                .cartItems(new ArrayList<>())
                .build();
    }
}
