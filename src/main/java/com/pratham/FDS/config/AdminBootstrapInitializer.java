package com.pratham.FDS.config;

import com.pratham.FDS.entity.Customer;
import com.pratham.FDS.enums.UserRole;
import com.pratham.FDS.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Controlled initial administrator setup mechanism.
 * Disabled by default. Enabled explicitly via app.bootstrap-admin.enabled=true
 * with BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD provided via environment variables.
 * Idempotent: Never overwrites existing accounts or creates duplicates.
 */
@Slf4j
@Component
@Order(5)
@RequiredArgsConstructor
public class AdminBootstrapInitializer implements CommandLineRunner {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.enabled:false}")
    private boolean bootstrapEnabled;

    @Value("${app.bootstrap-admin.email:}")
    private String bootstrapEmail;

    @Value("${app.bootstrap-admin.password:}")
    private String bootstrapPassword;

    @Override
    @Transactional
    public void run(String... args) {
        if (!bootstrapEnabled) {
            log.info("Admin bootstrap is disabled (app.bootstrap-admin.enabled=false).");
            return;
        }

        if (bootstrapEmail == null || bootstrapEmail.trim().isEmpty() ||
            bootstrapPassword == null || bootstrapPassword.trim().isEmpty()) {
            log.warn("Admin bootstrap is enabled, but BOOTSTRAP_ADMIN_EMAIL or BOOTSTRAP_ADMIN_PASSWORD is not configured. Skipping.");
            return;
        }

        String email = bootstrapEmail.trim().toLowerCase();

        if (customerRepository.findByEmail(email).isPresent()) {
            log.info("Administrator account with email '{}' already exists. Skipping bootstrap.", email);
            return;
        }

        Customer adminUser = Customer.builder()
                .name("System Administrator")
                .email(email)
                .password(passwordEncoder.encode(bootstrapPassword.trim()))
                .phone("9999999999")
                .role(UserRole.ADMIN)
                .build();

        customerRepository.save(adminUser);
        log.info("Controlled initial administrator account successfully provisioned for '{}'.", email);
    }
}
