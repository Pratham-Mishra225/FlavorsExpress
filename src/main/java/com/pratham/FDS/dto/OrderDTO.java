package com.pratham.FDS.dto;

import com.pratham.FDS.enums.OrderStatus;
import com.pratham.FDS.enums.PaymentStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Transfer Object for Order. Used in checkout responses and order history.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {

    private Long id;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    private String customerName;

    private String customerEmail;

    private String customerPhone;

    private Long deliveryPartnerId;

    private String deliveryPartnerName;

    @Builder.Default
    private List<OrderItemDTO> orderItems = new ArrayList<>();

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    private BigDecimal totalAmount;

    private BigDecimal discountAmount;

    @NotNull(message = "Order status is required")
    private OrderStatus status;

    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;

    @NotBlank(message = "Delivery address is required")
    @Size(max = 255, message = "Delivery address must be less than 255 characters")
    private String deliveryAddress;

    private String promoCode;

    private LocalDateTime estimatedDeliveryTime;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
