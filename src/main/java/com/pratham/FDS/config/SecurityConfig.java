package com.pratham.FDS.config;

import com.pratham.FDS.security.CustomUserDetailsService;
import com.pratham.FDS.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @org.springframework.beans.factory.annotation.Value("${cors.allowed-origins}")
    private List<String> allowedOrigins;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // 1. Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/menu-items/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/promo-codes/validate").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()

                        // 2. Delivery Partner specific endpoints
                        .requestMatchers("/api/delivery-partners/me/**").hasRole("DELIVERY")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/delivery-status").hasRole("DELIVERY")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/delivery-partner/*/status").hasRole("DELIVERY")

                        // 3. Customer Cart and Order endpoints
                        .requestMatchers("/api/cart", "/api/cart/**").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.POST, "/api/orders/checkout").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.GET, "/api/orders/my-orders").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.GET, "/api/orders/customer/**").hasRole("CUSTOMER")

                        // 4. Authenticated Order lookup (ownership enforced in service/controller)
                        .requestMatchers(HttpMethod.GET, "/api/orders/*").authenticated()

                        // 5. Admin Order and Dispatch endpoints
                        .requestMatchers(HttpMethod.GET, "/api/orders/status/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/assign-automatic").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/assign-manual/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/status").hasRole("ADMIN")

                        // 6. Admin Management (Categories, MenuItems, DeliveryPartners, Customers, Promos, Analytics)
                        .requestMatchers("/api/customers/**").hasRole("ADMIN")
                        .requestMatchers("/api/delivery-partners/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/menu-items/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/menu-items/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/menu-items/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/promo-codes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/promo-codes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/promo-codes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/promo-codes/**").hasRole("ADMIN")

                        .requestMatchers("/api/analytics/**").hasRole("ADMIN")

                        // 7. All other requests require authentication
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json");
                            response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Authentication required: "
                                    + (authException.getMessage() != null ? authException.getMessage().replace("\"", "\\\"") : "Invalid credentials") + "\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json");
                            response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN);
                            response.getWriter().write("{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Access denied: insufficient permissions\"}");
                        })
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
