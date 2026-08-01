package com.pratham.FDS.mapper;

import com.pratham.FDS.dto.PromoCodeDTO;
import com.pratham.FDS.entity.PromoCode;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between {@link PromoCode} entity and {@link PromoCodeDTO}.
 */
@Component
public class PromoCodeMapper {

    /**
     * Converts a {@link PromoCode} entity to a {@link PromoCodeDTO}.
     *
     * @param promoCode the entity to convert
     * @return the resulting DTO, or null if input is null
     */
    public PromoCodeDTO toDTO(PromoCode promoCode) {
        if (promoCode == null) {
            return null;
        }
        return PromoCodeDTO.builder()
                .id(promoCode.getId())
                .code(promoCode.getCode())
                .discountPercentage(promoCode.getDiscountPercentage())
                .maxDiscountAmount(promoCode.getMaxDiscountAmount())
                .minOrderAmount(promoCode.getMinOrderAmount())
                .isActive(promoCode.getIsActive())
                .expiryDate(promoCode.getExpiryDate())
                .usageLimit(promoCode.getUsageLimit())
                .usedCount(promoCode.getUsedCount())
                .build();
    }

    /**
     * Converts a {@link PromoCodeDTO} to a {@link PromoCode} entity.
     *
     * @param dto the DTO to convert
     * @return the resulting entity, or null if input is null
     */
    public PromoCode toEntity(PromoCodeDTO dto) {
        if (dto == null) {
            return null;
        }
        return PromoCode.builder()
                .code(dto.getCode())
                .discountPercentage(dto.getDiscountPercentage())
                .maxDiscountAmount(dto.getMaxDiscountAmount())
                .minOrderAmount(dto.getMinOrderAmount())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .expiryDate(dto.getExpiryDate())
                .usageLimit(dto.getUsageLimit())
                .usedCount(0)
                .build();
    }
}
