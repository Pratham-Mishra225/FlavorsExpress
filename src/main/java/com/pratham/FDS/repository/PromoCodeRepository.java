package com.pratham.FDS.repository;

import com.pratham.FDS.entity.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link PromoCode} entity.
 */
@Repository
public interface PromoCodeRepository extends JpaRepository<PromoCode, Long> {

    /** Find a promo code by its unique code string (case-sensitive). */
    Optional<PromoCode> findByCode(String code);

    /** Returns all currently active promo codes. */
    List<PromoCode> findByIsActiveTrue();
}
