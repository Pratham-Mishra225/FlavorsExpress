package com.pratham.FDS.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemRequest {

    /** Required when adding an item to the cart; optional when updating quantity of an existing item. */
    private Long menuItemId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @jakarta.validation.constraints.Max(value = 99, message = "Quantity cannot exceed 99")
    private Integer quantity;
}
