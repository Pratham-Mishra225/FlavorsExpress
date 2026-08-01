package com.pratham.FDS.service.impl;

import com.pratham.FDS.dto.PromoCodeDTO;
import com.pratham.FDS.entity.PromoCode;
import com.pratham.FDS.exception.BadRequestException;
import com.pratham.FDS.exception.ResourceNotFoundException;
import com.pratham.FDS.mapper.PromoCodeMapper;
import com.pratham.FDS.repository.PromoCodeRepository;
import com.pratham.FDS.service.PromoCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PromoCodeServiceImpl implements PromoCodeService {

    private final PromoCodeRepository promoCodeRepository;
    private final PromoCodeMapper promoCodeMapper;

    @Override
    public PromoCodeDTO createPromoCode(PromoCodeDTO promoCodeDTO) {
        log.info("Creating promo code: {}", promoCodeDTO.getCode());
        if (promoCodeRepository.findByCode(promoCodeDTO.getCode()).isPresent()) {
            throw new BadRequestException("Promo code '" + promoCodeDTO.getCode() + "' already exists");
        }
        PromoCode promoCode = promoCodeMapper.toEntity(promoCodeDTO);
        PromoCode saved = promoCodeRepository.save(promoCode);
        return promoCodeMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PromoCodeDTO getPromoCodeById(Long id) {
        log.info("Fetching promo code by id: {}", id);
        PromoCode promoCode = promoCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PromoCode", "id", id));
        return promoCodeMapper.toDTO(promoCode);
    }

    @Override
    @Transactional(readOnly = true)
    public PromoCodeDTO getPromoCodeByCode(String code) {
        log.info("Fetching promo code by code: {}", code);
        PromoCode promoCode = promoCodeRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("PromoCode", "code", code));
        return promoCodeMapper.toDTO(promoCode);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromoCodeDTO> getAllPromoCodes() {
        log.info("Fetching all promo codes");
        return promoCodeRepository.findAll().stream()
                .map(promoCodeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromoCodeDTO> getActivePromoCodes() {
        log.info("Fetching active promo codes");
        return promoCodeRepository.findByIsActiveTrue().stream()
                .map(promoCodeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PromoCodeDTO updatePromoCode(Long id, PromoCodeDTO promoCodeDTO) {
        log.info("Updating promo code with id: {}", id);
        PromoCode promoCode = promoCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PromoCode", "id", id));

        promoCodeRepository.findByCode(promoCodeDTO.getCode())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new BadRequestException("Promo code '" + promoCodeDTO.getCode() + "' already exists");
                    }
                });

        promoCode.setCode(promoCodeDTO.getCode());
        promoCode.setDiscountPercentage(promoCodeDTO.getDiscountPercentage());
        promoCode.setMaxDiscountAmount(promoCodeDTO.getMaxDiscountAmount());
        promoCode.setMinOrderAmount(promoCodeDTO.getMinOrderAmount());
        promoCode.setIsActive(promoCodeDTO.getIsActive() != null ? promoCodeDTO.getIsActive() : true);
        promoCode.setExpiryDate(promoCodeDTO.getExpiryDate());
        promoCode.setUsageLimit(promoCodeDTO.getUsageLimit());

        PromoCode updated = promoCodeRepository.save(promoCode);
        return promoCodeMapper.toDTO(updated);
    }

    @Override
    public void deletePromoCode(Long id) {
        log.info("Deleting promo code with id: {}", id);
        PromoCode promoCode = promoCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PromoCode", "id", id));
        promoCodeRepository.delete(promoCode);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal validatePromoCode(String code, BigDecimal orderTotal) {
        log.info("Validating promo code: {} for order total: {}", code, orderTotal);
        PromoCode promoCode = promoCodeRepository.findByCode(code)
                .orElseThrow(() -> new BadRequestException("Invalid promo code"));

        if (!promoCode.getIsActive()) {
            throw new BadRequestException("Promo code is inactive");
        }
        if (promoCode.getExpiryDate() != null && promoCode.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Promo code has expired");
        }
        if (promoCode.getUsedCount() >= promoCode.getUsageLimit()) {
            throw new BadRequestException("Promo code usage limit has been reached");
        }
        if (orderTotal.compareTo(promoCode.getMinOrderAmount()) < 0) {
            throw new BadRequestException(
                    "Minimum order total of " + promoCode.getMinOrderAmount() + " required to use this promo code");
        }

        BigDecimal discount = orderTotal
                .multiply(promoCode.getDiscountPercentage())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        if (discount.compareTo(promoCode.getMaxDiscountAmount()) > 0) {
            discount = promoCode.getMaxDiscountAmount();
        }
        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal applyPromoCode(String code, BigDecimal orderTotal) {
        log.info("Applying promo code: {} to order total: {}", code, orderTotal);
        BigDecimal discount = validatePromoCode(code, orderTotal);

        // Increment usage count on a separate write
        PromoCode promoCode = promoCodeRepository.findByCode(code)
                .orElseThrow(() -> new BadRequestException("Invalid promo code"));
        promoCode.setUsedCount(promoCode.getUsedCount() + 1);
        promoCodeRepository.save(promoCode);

        return discount;
    }
}
