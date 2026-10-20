package com.pratham.FDS.service.impl;

import com.pratham.FDS.dto.LoginRequest;
import com.pratham.FDS.dto.LoginResponse;
import com.pratham.FDS.dto.RegisterRequest;
import com.pratham.FDS.entity.Customer;
import com.pratham.FDS.enums.UserRole;
import com.pratham.FDS.exception.BadRequestException;
import com.pratham.FDS.exception.EmailAlreadyExistsException;
import com.pratham.FDS.repository.CustomerRepository;
import com.pratham.FDS.security.JwtUtil;
import com.pratham.FDS.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        if (request.getRole() != null && request.getRole() != UserRole.CUSTOMER) {
            log.warn("Attempt to register with privileged role '{}' rejected for email: {}", request.getRole(), request.getEmail());
            throw new BadRequestException("Public registration can only create customer accounts. Privileged role registration is forbidden.");
        }

        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new com.pratham.FDS.exception.EmailAlreadyExistsException(request.getEmail());
        }

        // Public registration always enforces CUSTOMER role on the server
        Customer customer = Customer.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone().trim())
                .role(UserRole.CUSTOMER)
                .build();

        customerRepository.save(customer);

        String jwtToken = jwtUtil.generateToken(customer);

        return LoginResponse.builder()
                .id(customer.getId())
                .token(jwtToken)
                .email(customer.getEmail())
                .role(customer.getRole())
                .build();
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        log.info("Authenticating user: {}", request.getEmail());
        
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(); // Should be found if authentication passed

        String jwtToken = jwtUtil.generateToken(customer);

        return LoginResponse.builder()
                .id(customer.getId())
                .token(jwtToken)
                .email(customer.getEmail())
                .role(customer.getRole())
                .build();
    }
}
