package com.pratham.FDS.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDTO {

    private Long id;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @Builder.Default
    private List<CartItemDTO> cartItems = new ArrayList<>();

    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    public List<CartItemDTO> getItems() {
        return cartItems;
    }

    public void setItems(List<CartItemDTO> items) {
        if (items != null) {
            this.cartItems = items;
        }
    }
}
