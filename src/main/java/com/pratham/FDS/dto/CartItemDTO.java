package com.pratham.FDS.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDTO {

    private Long id;

    @NotNull(message = "Menu item ID is required")
    private Long menuItemId;

    @JsonProperty("menuItemName")
    @JsonAlias({"name", "itemName"})
    private String menuItemName;

    private BigDecimal price;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    @JsonProperty("subTotal")
    @JsonAlias({"subtotal", "sub_total"})
    private BigDecimal subTotal;

    @JsonIgnore
    public String getName() {
        return menuItemName;
    }

    @JsonIgnore
    public void setName(String name) {
        if (this.menuItemName == null) {
            this.menuItemName = name;
        }
    }

    public BigDecimal getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(BigDecimal subTotal) {
        this.subTotal = subTotal;
    }

    @JsonIgnore
    public BigDecimal getSubtotal() {
        return subTotal;
    }

    @JsonIgnore
    public void setSubtotal(BigDecimal subtotal) {
        this.subTotal = subtotal;
    }
}
