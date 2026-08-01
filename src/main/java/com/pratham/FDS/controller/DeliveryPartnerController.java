package com.pratham.FDS.controller;

import com.pratham.FDS.dto.DeliveryPartnerDTO;
import com.pratham.FDS.enums.DeliveryPartnerStatus;
import com.pratham.FDS.service.DeliveryPartnerService;
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
