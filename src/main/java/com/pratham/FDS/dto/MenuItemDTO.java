package com.pratham.FDS.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

/**
 * Data Transfer Object for MenuItem. Used in create, update, and read operations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemDTO {

    private Long id;

    @NotBlank(message = "Item name is required")
    @Size(max = 100, message = "Item name must be less than 100 characters")
    private String name;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @Builder.Default
    private Boolean isAvailable = true;

    @Builder.Default
    private Boolean isVegetarian = false;

    @Builder.Default
    @PositiveOrZero(message = "Preparation time must be zero or positive")
    private Integer preparationTimeMinutes = 15;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    /** Display-only: populated on responses, ignored on create/update requests. */
    private String categoryName;
}
