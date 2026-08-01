package com.pratham.FDS.service;

import com.pratham.FDS.dto.DeliveryPartnerDTO;
import com.pratham.FDS.enums.DeliveryPartnerStatus;

import java.util.List;

public interface DeliveryPartnerService {

    DeliveryPartnerDTO createDeliveryPartner(DeliveryPartnerDTO deliveryPartnerDTO);

    DeliveryPartnerDTO getDeliveryPartnerById(Long id);

    List<DeliveryPartnerDTO> getAllDeliveryPartners();

    List<DeliveryPartnerDTO> getDeliveryPartnersByStatus(DeliveryPartnerStatus status);

    DeliveryPartnerDTO updateDeliveryPartner(Long id, DeliveryPartnerDTO deliveryPartnerDTO);

    void deleteDeliveryPartner(Long id);
}
