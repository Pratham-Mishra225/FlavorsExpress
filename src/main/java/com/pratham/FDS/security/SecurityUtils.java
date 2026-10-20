package com.pratham.FDS.security;

import com.pratham.FDS.entity.Customer;
import com.pratham.FDS.entity.DeliveryPartner;
import com.pratham.FDS.entity.Order;
import com.pratham.FDS.enums.UserRole;
import com.pratham.FDS.exception.ResourceNotFoundException;
import com.pratham.FDS.repository.CustomerRepository;
import com.pratham.FDS.repository.DeliveryPartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Helper utility to derive authenticated user details and enforce
 * ownership boundaries consistently across services and controllers.
 */
@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final CustomerRepository customerRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;

    public Authentication getAuthentication() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AccessDeniedException("User is not authenticated");
        }
        return auth;
    }

    public String getCurrentUserEmail() {
        return getAuthentication().getName();
    }

    public Customer getCurrentCustomer() {
        String email = getCurrentUserEmail();
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "email", email));
    }

    public DeliveryPartner getCurrentDeliveryPartner() {
        Customer current = getCurrentCustomer();
        return deliveryPartnerRepository.findByUserAccountId(current.getId())
                .or(() -> deliveryPartnerRepository.findByEmail(current.getEmail()))
                .orElseThrow(() -> new AccessDeniedException("No delivery partner profile is linked to this account"));
    }

    public boolean isAdmin() {
        Authentication auth = getAuthentication();
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    public boolean isDeliveryPartner() {
        Authentication auth = getAuthentication();
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DELIVERY"));
    }

    public boolean isCustomer() {
        Authentication auth = getAuthentication();
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
    }

    /**
     * Enforces that the caller owns the specified customer resource,
     * unless the caller has administrative privileges.
     */
    public void validateCustomerOwnership(Long customerId) {
        if (isAdmin()) {
            return;
        }
        Customer current = getCurrentCustomer();
        if (!current.getId().equals(customerId)) {
            throw new AccessDeniedException("Access denied: You cannot access or modify another customer's resource.");
        }
    }

    /**
     * Enforces that the caller is authorized to view or manage the specified order.
     * - Admins can access all orders.
     * - Customers can access only their own orders.
     * - Delivery partners can access only orders assigned to them.
     */
    public void validateOrderAccess(Order order) {
        if (isAdmin()) {
            return;
        }

        Customer current = getCurrentCustomer();

        if (current.getRole() == UserRole.CUSTOMER) {
            if (order.getCustomer() == null || !order.getCustomer().getId().equals(current.getId())) {
                throw new AccessDeniedException("Access denied: You do not own this order.");
            }
            return;
        }

        if (current.getRole() == UserRole.DELIVERY_PARTNER) {
            DeliveryPartner partner = order.getDeliveryPartner();
            if (partner == null || partner.getUserAccount() == null ||
                !partner.getUserAccount().getId().equals(current.getId())) {
                throw new AccessDeniedException("Access denied: You are not assigned to this delivery order.");
            }
            return;
        }

        throw new AccessDeniedException("Access denied: Insufficient privileges to view this order.");
    }
}
