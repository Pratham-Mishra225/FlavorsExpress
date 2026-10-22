package com.pratham.FDS.security;

import com.pratham.FDS.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final CustomerRepository customerRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Normalize to match the lowercase storage convention used at account creation
        String normalizedEmail = (email != null) ? email.trim().toLowerCase() : "";
        return customerRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No account found with email: " + normalizedEmail));
    }
}
