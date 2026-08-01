package com.pratham.FDS.service;

import com.pratham.FDS.dto.PromoCodeDTO;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service for managing promo codes (admin CRUD) and applying discount logic during checkout.
 */
public interface PromoCodeService {

    /** Creates a new promo code. */
    PromoCodeDTO createPromoCode(PromoCodeDTO promoCodeDTO);

    /** Retrieves a promo code by its database ID. */
    PromoCodeDTO getPromoCodeById(Long id);

    /** Retrieves a promo code by its code string. */
    PromoCodeDTO getPromoCodeByCode(String code);

    /** Returns all promo codes in the system. */
    List<PromoCodeDTO> getAllPromoCodes();

    /** Returns only currently active promo codes. */
    List<PromoCodeDTO> getActivePromoCodes();

    /** Updates an existing promo code. */
    PromoCodeDTO updatePromoCode(Long id, PromoCodeDTO promoCodeDTO);

    /** Deletes a promo code by its database ID. */
    void deletePromoCode(Long id);

    /**
     * Validates a promo code and returns the calculated discount amount <em>without</em> incrementing usage count.
     * Throws {@link com.pratham.FDS.exception.BadRequestException} if the code is invalid, expired, inactive,
     * usage limit is reached, or the order total is below the minimum.
     *
     * @param code       the promo code string
     * @param orderTotal the pre-discount order total
     * @return the discount amount the customer would receive
     */
    BigDecimal validatePromoCode(String code, BigDecimal orderTotal);

    /**
     * Validates and applies a promo code — increments usage count on success.
     * Throws the same exceptions as {@link #validatePromoCode}.
     *
     * @param code       the promo code string
     * @param orderTotal the pre-discount order total
     * @return the discount amount applied to the order
     */
    BigDecimal applyPromoCode(String code, BigDecimal orderTotal);
}
