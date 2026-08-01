package com.pratham.FDS.service.impl;

import com.pratham.FDS.dto.DeliveryPartnerDTO;
import com.pratham.FDS.entity.DeliveryPartner;
import com.pratham.FDS.enums.DeliveryPartnerStatus;
import com.pratham.FDS.exception.EmailAlreadyExistsException;
import com.pratham.FDS.exception.ResourceNotFoundException;
import com.pratham.FDS.mapper.DeliveryPartnerMapper;
import com.pratham.FDS.repository.DeliveryPartnerRepository;
import com.pratham.FDS.service.DeliveryPartnerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DeliveryPartnerServiceImpl implements DeliveryPartnerService {

    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final DeliveryPartnerMapper deliveryPartnerMapper;

    @Override
    public DeliveryPartnerDTO createDeliveryPartner(DeliveryPartnerDTO dto) {
        log.info("Creating delivery partner with email: {}", dto.getEmail());
        if (deliveryPartnerRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException(dto.getEmail());
        }
        DeliveryPartner partner = deliveryPartnerMapper.toEntity(dto);
        DeliveryPartner savedPartner = deliveryPartnerRepository.save(partner);
        log.info("Delivery partner created successfully with ID: {}", savedPartner.getId());
        return deliveryPartnerMapper.toDTO(savedPartner);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryPartnerDTO getDeliveryPartnerById(Long id) {
        log.info("Fetching delivery partner with ID: {}", id);
        DeliveryPartner partner = deliveryPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryPartner", "id", id));
        return deliveryPartnerMapper.toDTO(partner);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryPartnerDTO> getAllDeliveryPartners() {
        log.info("Fetching all delivery partners");
        return deliveryPartnerRepository.findAll()
                .stream()
                .map(deliveryPartnerMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryPartnerDTO> getDeliveryPartnersByStatus(DeliveryPartnerStatus status) {
        log.info("Fetching delivery partners with status: {}", status);
        return deliveryPartnerRepository.findByStatus(status)
                .stream()
                .map(deliveryPartnerMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DeliveryPartnerDTO updateDeliveryPartner(Long id, DeliveryPartnerDTO dto) {
        log.info("Updating delivery partner with ID: {}", id);
        DeliveryPartner existing = deliveryPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryPartner", "id", id));

        // Check email uniqueness only if being changed
        if (!existing.getEmail().equalsIgnoreCase(dto.getEmail())
                && deliveryPartnerRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException(dto.getEmail());
        }

        existing.setName(dto.getName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        existing.setStatus(dto.getStatus());

        DeliveryPartner updated = deliveryPartnerRepository.save(existing);
        log.info("Delivery partner updated successfully with ID: {}", updated.getId());
        return deliveryPartnerMapper.toDTO(updated);
    }

    @Override
    public void deleteDeliveryPartner(Long id) {
        log.info("Deleting delivery partner with ID: {}", id);
        DeliveryPartner partner = deliveryPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryPartner", "id", id));
        deliveryPartnerRepository.delete(partner);
        log.info("Delivery partner deleted successfully with ID: {}", id);
    }
}
