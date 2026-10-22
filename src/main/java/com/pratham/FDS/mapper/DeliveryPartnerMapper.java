package com.pratham.FDS.mapper;

import com.pratham.FDS.dto.DeliveryPartnerDTO;
import com.pratham.FDS.entity.DeliveryPartner;
import org.springframework.stereotype.Component;

@Component
public class DeliveryPartnerMapper {

    public DeliveryPartnerDTO toDTO(DeliveryPartner partner) {
        if (partner == null) {
            return null;
        }
        return DeliveryPartnerDTO.builder()
                .id(partner.getId())
                .name(partner.getName())
                .email(partner.getEmail())
                .phone(partner.getPhone())
                .status(partner.getStatus())
                .lastAssignedAt(partner.getLastAssignedAt())
                .build();
    }

    public DeliveryPartner toEntity(DeliveryPartnerDTO dto) {
        if (dto == null) {
            return null;
        }
        return DeliveryPartner.builder()
                .id(dto.getId())
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .status(dto.getStatus())
                .lastAssignedAt(dto.getLastAssignedAt())
                .build();
    }
}
