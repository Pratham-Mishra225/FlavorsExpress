package com.pratham.FDS.mapper;

import com.pratham.FDS.dto.CartItemDTO;
import com.pratham.FDS.entity.Cart;
import com.pratham.FDS.entity.CartItem;
import com.pratham.FDS.entity.MenuItem;
import org.springframework.stereotype.Component;

@Component
public class CartItemMapper {

    public CartItemDTO toDTO(CartItem cartItem) {
        if (cartItem == null) {
            return null;
        }
        java.math.BigDecimal itemPrice = cartItem.getMenuItem() != null ? cartItem.getMenuItem().getPrice() : null;
        java.math.BigDecimal subTotal = (itemPrice != null && cartItem.getQuantity() != null)
                ? itemPrice.multiply(java.math.BigDecimal.valueOf(cartItem.getQuantity()))
                : java.math.BigDecimal.ZERO;

        return CartItemDTO.builder()
                .id(cartItem.getId())
                .menuItemId(cartItem.getMenuItem() != null ? cartItem.getMenuItem().getId() : null)
                .menuItemName(cartItem.getMenuItem() != null ? cartItem.getMenuItem().getName() : null)
                .price(itemPrice)
                .quantity(cartItem.getQuantity())
                .subTotal(subTotal)
                .build();
    }

    public CartItem toEntity(CartItemDTO dto, Cart cart, MenuItem menuItem) {
        if (dto == null) {
            return null;
        }
        return CartItem.builder()
                .id(dto.getId())
                .cart(cart)
                .menuItem(menuItem)
                .quantity(dto.getQuantity())
                .build();
    }
}
