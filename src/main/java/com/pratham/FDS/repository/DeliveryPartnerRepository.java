package com.pratham.FDS.repository;

import com.pratham.FDS.entity.DeliveryPartner;
import com.pratham.FDS.enums.DeliveryPartnerStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {
    Optional<DeliveryPartner> findByEmail(String email);
    Optional<DeliveryPartner> findByUserAccountId(Long customerId);
    Optional<DeliveryPartner> findByUserAccountEmail(String email);
    List<DeliveryPartner> findByStatus(DeliveryPartnerStatus status);
    long countByStatus(DeliveryPartnerStatus status);
    long countByStatusNot(DeliveryPartnerStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT dp FROM DeliveryPartner dp WHERE dp.id = :id")
    Optional<DeliveryPartner> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT dp FROM DeliveryPartner dp " +
           "WHERE dp.status = com.pratham.FDS.enums.DeliveryPartnerStatus.AVAILABLE " +
           "  AND (SELECT COUNT(o) FROM Order o WHERE o.deliveryPartner.id = dp.id AND o.status NOT IN (com.pratham.FDS.enums.OrderStatus.DELIVERED, com.pratham.FDS.enums.OrderStatus.CANCELLED)) = 0 " +
           "ORDER BY CASE WHEN dp.lastAssignedAt IS NULL THEN 0 ELSE 1 END, dp.lastAssignedAt ASC, dp.id ASC")
    List<DeliveryPartner> findEligiblePartnersForAssignment();
}
