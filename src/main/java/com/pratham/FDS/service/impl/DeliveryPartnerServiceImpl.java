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

import com.pratham.FDS.entity.Customer;
import com.pratham.FDS.enums.UserRole;
import com.pratham.FDS.repository.CustomerRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.pratham.FDS.exception.BadRequestException;
import com.pratham.FDS.repository.OrderRepository;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DeliveryPartnerServiceImpl implements DeliveryPartnerService {

    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final DeliveryPartnerMapper deliveryPartnerMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public DeliveryPartnerDTO createDeliveryPartner(DeliveryPartnerDTO dto) {
        log.info("Creating delivery partner with email: {}", dto.getEmail());
        String normalizedEmail = dto.getEmail().trim().toLowerCase();

        if (deliveryPartnerRepository.findByEmail(normalizedEmail).isPresent()
                || customerRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException(normalizedEmail);
        }

        // Require an explicit initial password — no silent fallback
        if (dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {
            throw new BadRequestException("An initial login password is required when registering a delivery partner.");
        }
        String rawPassword = dto.getPassword().trim();

        // 1. Provision linked login account with DELIVERY_PARTNER role
        Customer customerAccount = Customer.builder()
                .name(dto.getName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(rawPassword))
                .phone(dto.getPhone().trim())
                .role(UserRole.DELIVERY_PARTNER)
                .build();
        Customer savedCustomer = customerRepository.save(customerAccount);

        // 2. Provision DeliveryPartner domain record linked to the user account
        DeliveryPartner partner = deliveryPartnerMapper.toEntity(dto);
        partner.setEmail(normalizedEmail);
        partner.setUserAccount(savedCustomer);
        DeliveryPartner savedPartner = deliveryPartnerRepository.save(partner);

        log.info("Delivery partner created successfully with ID: {} and linked customer user ID: {}",
                savedPartner.getId(), savedCustomer.getId());
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
    public DeliveryPartnerDTO updateAvailability(Long id, DeliveryPartnerStatus newStatus) {
        log.info("Updating availability for delivery partner ID {} to {}", id, newStatus);
        DeliveryPartner partner = deliveryPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryPartner", "id", id));

        if (newStatus == null) {
            throw new BadRequestException("Status is required (AVAILABLE, BUSY, or OFFLINE)");
        }

        if (partner.getStatus() == newStatus) {
            return deliveryPartnerMapper.toDTO(partner);
        }

        // Prevent a partner with an active delivery from manually setting their status to AVAILABLE or OFFLINE
        long activeCount = orderRepository.countActiveDeliveriesByPartnerId(partner.getId());
        if (activeCount > 0 && newStatus != DeliveryPartnerStatus.BUSY) {
            throw new BadRequestException(
                    "Cannot set status to " + newStatus + " while handling " + activeCount + " active delivery assignment(s). " +
                    "Complete all active deliveries first."
            );
        }

        partner.setStatus(newStatus);
        DeliveryPartner saved = deliveryPartnerRepository.save(partner);
        log.info("Delivery partner ID {} availability successfully updated to {}", id, newStatus);
        return deliveryPartnerMapper.toDTO(saved);
    }

    @Override
    public void deleteDeliveryPartner(Long id) {
        log.info("Deleting delivery partner with ID: {}", id);
        DeliveryPartner partner = deliveryPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryPartner", "id", id));
        Customer userAccount = partner.getUserAccount();
        deliveryPartnerRepository.delete(partner);
        if (userAccount != null) {
            customerRepository.delete(userAccount);
        }
        log.info("Delivery partner and associated login account deleted successfully with ID: {}", id);
    }
}
