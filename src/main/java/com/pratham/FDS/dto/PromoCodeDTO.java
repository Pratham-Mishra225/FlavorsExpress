package com.pratham.FDS.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for creating and reading PromoCode data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromoCodeDTO {

    private Long id;

    @NotBlank(message = "Promo code is required")
    @Size(max = 50, message = "Promo code must be less than 50 characters")
    private String code;

    @NotNull(message = "Discount percentage is required")
    @DecimalMin(value = "0.0", message = "Discount must be at least 0")
    @DecimalMax(value = "100.0", message = "Discount cannot exceed 100%")
    private BigDecimal discountPercentage;

    @NotNull(message = "Max discount amount is required")
    @DecimalMin(value = "0.0", message = "Max discount must be positive")
    private BigDecimal maxDiscountAmount;

    @NotNull(message = "Min order amount is required")
    @DecimalMin(value = "0.0", message = "Min order amount must be positive")
    private BigDecimal minOrderAmount;

    @Builder.Default
    private Boolean isActive = true;

    @NotNull(message = "Expiry date is required")
    private LocalDateTime expiryDate;

    @NotNull(message = "Usage limit is required")
    @Min(value = 1, message = "Usage limit must be at least 1")
    private Integer usageLimit;

    private Integer usedCount;
}
