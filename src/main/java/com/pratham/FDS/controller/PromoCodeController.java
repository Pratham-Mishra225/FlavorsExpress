package com.pratham.FDS.controller;

import com.pratham.FDS.dto.PromoCodeDTO;
import com.pratham.FDS.dto.PromoValidateRequest;
import com.pratham.FDS.service.PromoCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Controller for managing promo codes and validation discounts.
 */
@RestController
@RequestMapping("/api/promo-codes")
@RequiredArgsConstructor
@Tag(name = "Promo Code Controller", description = "Endpoints for administering and validating discount promo codes")
public class PromoCodeController {

    private final PromoCodeService promoCodeService;

    @PostMapping
    @Operation(summary = "Create a new promo code", description = "Admin only. Creates a new promo code with percentage and limits.")
    @ApiResponse(responseCode = "201", description = "Promo code created successfully")
    public ResponseEntity<PromoCodeDTO> createPromoCode(@Valid @RequestBody PromoCodeDTO promoCodeDTO) {
        return new ResponseEntity<>(promoCodeService.createPromoCode(promoCodeDTO), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get promo code by ID", description = "Admin only. Retrieves specific promo code details.")
    public ResponseEntity<PromoCodeDTO> getPromoCodeById(@PathVariable Long id) {
        return ResponseEntity.ok(promoCodeService.getPromoCodeById(id));
    }

    @GetMapping
    @Operation(summary = "Get all promo codes", description = "Admin only. Lists all defined promo codes.")
    public ResponseEntity<List<PromoCodeDTO>> getAllPromoCodes() {
        return ResponseEntity.ok(promoCodeService.getAllPromoCodes());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update promo code details", description = "Admin only. Modifies properties of an existing promo code.")
    public ResponseEntity<PromoCodeDTO> updatePromoCode(
            @PathVariable Long id,
            @Valid @RequestBody PromoCodeDTO promoCodeDTO) {
        return ResponseEntity.ok(promoCodeService.updatePromoCode(id, promoCodeDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete promo code", description = "Admin only. Removes a promo code from the system.")
    @ApiResponse(responseCode = "204", description = "Promo code deleted")
    public ResponseEntity<Void> deletePromoCode(@PathVariable Long id) {
        promoCodeService.deletePromoCode(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate and preview discount", description = "Public. Checks if a promo code is valid and returns the discount amount without applying it.")
    @ApiResponse(responseCode = "200", description = "Promo code is valid, discount returned")
    public ResponseEntity<Map<String, BigDecimal>> validatePromoCode(
            @Valid @RequestBody PromoValidateRequest request) {
        BigDecimal discount = promoCodeService.validatePromoCode(request.getCode(), request.getOrderTotal());
        return ResponseEntity.ok(Map.of("discountAmount", discount));
    }
}
