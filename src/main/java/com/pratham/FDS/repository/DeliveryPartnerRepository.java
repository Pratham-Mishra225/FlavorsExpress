package com.pratham.FDS.repository;

import com.pratham.FDS.entity.DeliveryPartner;
import com.pratham.FDS.enums.DeliveryPartnerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
