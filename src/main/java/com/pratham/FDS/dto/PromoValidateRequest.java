package com.pratham.FDS.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request body for promo code validation (pre-checkout discount preview).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromoValidateRequest {

    @NotBlank(message = "Promo code is required")
    private String code;

    @NotNull(message = "Order total is required")
    private java.math.BigDecimal orderTotal;
}
