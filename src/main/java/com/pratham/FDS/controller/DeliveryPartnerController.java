package com.pratham.FDS.controller;

import com.pratham.FDS.dto.DeliveryPartnerDTO;
import com.pratham.FDS.enums.DeliveryPartnerStatus;
import com.pratham.FDS.dto.OrderDTO;
import com.pratham.FDS.entity.DeliveryPartner;
import com.pratham.FDS.security.SecurityUtils;
import com.pratham.FDS.service.DeliveryPartnerService;
import com.pratham.FDS.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-partners")
@RequiredArgsConstructor
public class DeliveryPartnerController {

    private final DeliveryPartnerService deliveryPartnerService;
    private final OrderService orderService;
    private final SecurityUtils securityUtils;

    @GetMapping("/me/orders")
    public ResponseEntity<List<OrderDTO>> getMyAssignedOrders() {
        DeliveryPartner partner = securityUtils.getCurrentDeliveryPartner();
        return ResponseEntity.ok(orderService.getOrdersByDeliveryPartner(partner.getId()));
    }

    @GetMapping("/me")
    public ResponseEntity<DeliveryPartnerDTO> getMyProfile() {
        DeliveryPartner partner = securityUtils.getCurrentDeliveryPartner();
        return ResponseEntity.ok(deliveryPartnerService.getDeliveryPartnerById(partner.getId()));
    }

    @PutMapping({"/me/status", "/me/availability"})
    public ResponseEntity<DeliveryPartnerDTO> updateMyStatus(
            @RequestParam(required = false) DeliveryPartnerStatus status,
            @RequestBody(required = false) java.util.Map<String, Object> body) {
        DeliveryPartner partner = securityUtils.getCurrentDeliveryPartner();
        DeliveryPartnerStatus targetStatus = status;
        if (targetStatus == null && body != null && body.containsKey("status")) {
            try {
                targetStatus = DeliveryPartnerStatus.valueOf(body.get("status").toString().trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new com.pratham.FDS.exception.BadRequestException("Invalid status. Allowed values: AVAILABLE, BUSY, OFFLINE");
            }
        }
        if (targetStatus == null) {
            throw new com.pratham.FDS.exception.BadRequestException("Status is required (AVAILABLE, BUSY, or OFFLINE)");
        }
        return ResponseEntity.ok(deliveryPartnerService.updateAvailability(partner.getId(), targetStatus));
    }

    @PostMapping
    public ResponseEntity<DeliveryPartnerDTO> createDeliveryPartner(
            @Valid @RequestBody DeliveryPartnerDTO deliveryPartnerDTO) {
        return new ResponseEntity<>(deliveryPartnerService.createDeliveryPartner(deliveryPartnerDTO), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryPartnerDTO> getDeliveryPartnerById(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryPartnerService.getDeliveryPartnerById(id));
    }

    @GetMapping
    public ResponseEntity<List<DeliveryPartnerDTO>> getAllDeliveryPartners() {
        return ResponseEntity.ok(deliveryPartnerService.getAllDeliveryPartners());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<DeliveryPartnerDTO>> getByStatus(@PathVariable DeliveryPartnerStatus status) {
        return ResponseEntity.ok(deliveryPartnerService.getDeliveryPartnersByStatus(status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeliveryPartnerDTO> updateDeliveryPartner(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryPartnerDTO deliveryPartnerDTO) {
        return ResponseEntity.ok(deliveryPartnerService.updateDeliveryPartner(id, deliveryPartnerDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeliveryPartner(@PathVariable Long id) {
        deliveryPartnerService.deleteDeliveryPartner(id);
        return ResponseEntity.noContent().build();
    }
}
