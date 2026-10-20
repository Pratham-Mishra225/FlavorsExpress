package com.pratham.FDS.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pratham.FDS.dto.CheckoutRequest;
import com.pratham.FDS.dto.DeliveryPartnerDTO;
import com.pratham.FDS.dto.LoginRequest;
import com.pratham.FDS.dto.MenuItemDTO;
import com.pratham.FDS.entity.*;
import com.pratham.FDS.enums.DeliveryPartnerStatus;
import com.pratham.FDS.enums.OrderStatus;
import com.pratham.FDS.enums.PaymentStatus;
import com.pratham.FDS.enums.UserRole;
import com.pratham.FDS.repository.*;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import javax.crypto.SecretKey;
import java.math.BigDecimal;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class SecurityIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DeliveryPartnerRepository deliveryPartnerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private Customer customerA;
    private Customer customerB;
    private Customer adminUser;
    private Customer deliveryUserA;
    private DeliveryPartner deliveryPartnerA;
    private DeliveryPartner deliveryPartnerB;
    private MenuItem testMenuItem;

    private String tokenCustomerA;
    private String tokenCustomerB;
    private String tokenAdmin;
    private String tokenDeliveryA;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        // Ensure Category and MenuItem exist
        Category cat = categoryRepository.save(Category.builder()
                .name("SecTestCat-" + System.nanoTime())
                .description("Test Category")
                .build());

        testMenuItem = menuRepository.save(MenuItem.builder()
                .name("SecTestItem-" + System.nanoTime())
                .description("Delicious test food")
                .price(new BigDecimal("10.00"))
                .isAvailable(true)
                .isVegetarian(true)
                .preparationTimeMinutes(15)
                .category(cat)
                .build());

        // Create Customer A
        customerA = customerRepository.save(Customer.builder()
                .name("Customer A")
                .email("custA-" + System.nanoTime() + "@test.com")
                .password(passwordEncoder.encode("Password123!"))
                .phone("1111111111")
                .role(UserRole.CUSTOMER)
                .build());

        // Create Customer B
        customerB = customerRepository.save(Customer.builder()
                .name("Customer B")
                .email("custB-" + System.nanoTime() + "@test.com")
                .password(passwordEncoder.encode("Password123!"))
                .phone("2222222222")
                .role(UserRole.CUSTOMER)
                .build());

        // Create Admin
        adminUser = customerRepository.save(Customer.builder()
                .name("Admin User")
                .email("admin-" + System.nanoTime() + "@test.com")
                .password(passwordEncoder.encode("AdminPass123!"))
                .phone("3333333333")
                .role(UserRole.ADMIN)
                .build());

        // Create Delivery User A and Partner A
        deliveryUserA = customerRepository.save(Customer.builder()
                .name("Delivery Partner A")
                .email("delivA-" + System.nanoTime() + "@test.com")
                .password(passwordEncoder.encode("PartnerPass123!"))
                .phone("4444444444")
                .role(UserRole.DELIVERY_PARTNER)
                .build());

        deliveryPartnerA = deliveryPartnerRepository.save(DeliveryPartner.builder()
                .name("Delivery Partner A")
                .email(deliveryUserA.getEmail())
                .phone("4444444444")
                .status(DeliveryPartnerStatus.AVAILABLE)
                .userAccount(deliveryUserA)
                .build());

        // Create Delivery Partner B
        Customer deliveryUserB = customerRepository.save(Customer.builder()
                .name("Delivery Partner B")
                .email("delivB-" + System.nanoTime() + "@test.com")
                .password(passwordEncoder.encode("PartnerPass123!"))
                .phone("5555555555")
                .role(UserRole.DELIVERY_PARTNER)
                .build());

        deliveryPartnerB = deliveryPartnerRepository.save(DeliveryPartner.builder()
                .name("Delivery Partner B")
                .email(deliveryUserB.getEmail())
                .phone("5555555555")
                .status(DeliveryPartnerStatus.AVAILABLE)
                .userAccount(deliveryUserB)
                .build());

        tokenCustomerA = jwtUtil.generateToken(customerA);
        tokenCustomerB = jwtUtil.generateToken(customerB);
        tokenAdmin = jwtUtil.generateToken(adminUser);
        tokenDeliveryA = jwtUtil.generateToken(deliveryUserA);
    }

    // =========================================================================
    // A. Registration Tests
    // =========================================================================

    @Test
    @DisplayName("Public registration successfully creates a CUSTOMER account with hashed password")
    void testPublicRegistrationCreatesCustomer() throws Exception {
        String email = "newuser-" + System.nanoTime() + "@test.com";
        Map<String, String> body = Map.of(
                "name", "New Customer",
                "email", email,
                "password", "SecurePassword123!",
                "phone", "1234567890"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("CUSTOMER"));

        Customer saved = customerRepository.findByEmail(email).orElseThrow();
        assertThat(saved.getRole()).isEqualTo(UserRole.CUSTOMER);
        assertThat(saved.getPassword()).isNotEqualTo("SecurePassword123!");
        assertThat(passwordEncoder.matches("SecurePassword123!", saved.getPassword())).isTrue();
    }

    @Test
    @DisplayName("Registration request containing role: ADMIN is rejected and cannot create an administrator")
    void testRegistrationWithPrivilegedRoleAdminRejected() throws Exception {
        String email = "hacker-" + System.nanoTime() + "@test.com";
        Map<String, String> body = Map.of(
                "name", "Unauthorized Hacker",
                "email", email,
                "password", "HackerPassword123!",
                "phone", "1234567890",
                "role", "ADMIN"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());

        assertThat(customerRepository.findByEmail(email)).isEmpty();
    }

    @Test
    @DisplayName("Registration request containing role: DELIVERY_PARTNER is rejected")
    void testRegistrationWithPrivilegedRoleDeliveryPartnerRejected() throws Exception {
        String email = "fake-delivery-" + System.nanoTime() + "@test.com";
        Map<String, String> body = Map.of(
                "name", "Fake Delivery",
                "email", email,
                "password", "PartnerPassword123!",
                "phone", "1234567890",
                "role", "DELIVERY_PARTNER"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());

        assertThat(customerRepository.findByEmail(email)).isEmpty();
    }

    @Test
    @DisplayName("Duplicate account registration is rejected with 409 Conflict")
    void testDuplicateAccountRegistrationRejected() throws Exception {
        Map<String, String> body = Map.of(
                "name", "Duplicate User",
                "email", customerA.getEmail(),
                "password", "Password123!",
                "phone", "9998887776"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict());
    }

    // =========================================================================
    // B. Authentication Tests
    // =========================================================================

    @Test
    @DisplayName("Correct credentials produce a valid JWT token")
    void testLoginWithCorrectCredentials() throws Exception {
        LoginRequest req = new LoginRequest(customerA.getEmail(), "Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    @DisplayName("Incorrect credentials are rejected with 401 Unauthorized or Bad Request")
    void testLoginWithIncorrectCredentials() throws Exception {
        LoginRequest req = new LoginRequest(customerA.getEmail(), "WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Absent token cannot access protected endpoint")
    void testProtectedEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/cart/my-cart"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Malformed token is rejected with 401 Unauthorized")
    void testProtectedEndpointWithMalformedToken() throws Exception {
        mockMvc.perform(get("/api/cart/my-cart")
                        .header("Authorization", "Bearer this-is-not-a-valid-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Expired token is rejected with 401 Unauthorized")
    void testProtectedEndpointWithExpiredToken() throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);

        String expiredToken = Jwts.builder()
                .subject(customerA.getEmail())
                .claim("role", "ROLE_CUSTOMER")
                .issuedAt(new Date(System.currentTimeMillis() - 100000))
                .expiration(new Date(System.currentTimeMillis() - 1000))
                .signWith(key, Jwts.SIG.HS512)
                .compact();

        mockMvc.perform(get("/api/cart/my-cart")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized());
    }

    // =========================================================================
    // C. Role Authorization Tests
    // =========================================================================

    @Test
    @DisplayName("Customer cannot create or modify menu items (403 Forbidden)")
    void testCustomerCannotCreateMenuItem() throws Exception {
        MenuItemDTO dto = MenuItemDTO.builder()
                .name("Forbidden Burger")
                .price(new BigDecimal("12.99"))
                .categoryId(testMenuItem.getCategory().getId())
                .isAvailable(true)
                .build();

        mockMvc.perform(post("/api/menu-items")
                        .header("Authorization", "Bearer " + tokenCustomerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer cannot invoke administrative analytics APIs (403 Forbidden)")
    void testCustomerCannotAccessAdminAnalytics() throws Exception {
        mockMvc.perform(get("/api/analytics/admin")
                        .header("Authorization", "Bearer " + tokenCustomerA))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Delivery partner cannot invoke administrator-only APIs (403 Forbidden)")
    void testDeliveryPartnerCannotAccessAdminAnalytics() throws Exception {
        mockMvc.perform(get("/api/analytics/admin")
                        .header("Authorization", "Bearer " + tokenDeliveryA))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Delivery partner cannot access customer cart APIs (403 Forbidden)")
    void testDeliveryPartnerCannotAccessCustomerCart() throws Exception {
        mockMvc.perform(get("/api/cart/my-cart")
                        .header("Authorization", "Bearer " + tokenDeliveryA))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Administrator can access authorized management endpoints (200 OK)")
    void testAdminCanAccessAnalytics() throws Exception {
        mockMvc.perform(get("/api/analytics/admin")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Public menu browsing continues to work without authentication (200 OK)")
    void testPublicMenuBrowsingWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/menu-items"))
                .andExpect(status().isOk());
    }

    // =========================================================================
    // D. Ownership Tests
    // =========================================================================

    @Test
    @DisplayName("Customer A can access Customer A's cart")
    void testCustomerAccessOwnCart() throws Exception {
        mockMvc.perform(get("/api/cart/" + customerA.getId())
                        .header("Authorization", "Bearer " + tokenCustomerA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(customerA.getId()));
    }

    @Test
    @DisplayName("Customer A cannot view or modify Customer B's cart (403 Forbidden)")
    void testCustomerCannotAccessOtherCustomerCart() throws Exception {
        mockMvc.perform(get("/api/cart/" + customerB.getId())
                        .header("Authorization", "Bearer " + tokenCustomerA))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer A cannot retrieve Customer B's order by ID (403 Forbidden)")
    void testCustomerCannotRetrieveOtherCustomerOrder() throws Exception {
        Order orderB = orderRepository.save(Order.builder()
                .customer(customerB)
                .deliveryAddress("456 Elm St")
                .totalAmount(new BigDecimal("25.00"))
                .status(OrderStatus.PLACED)
                .paymentStatus(PaymentStatus.PENDING)
                .build());

        mockMvc.perform(get("/api/orders/" + orderB.getId())
                        .header("Authorization", "Bearer " + tokenCustomerA))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer A cannot place an order on behalf of Customer B by changing customerId in request")
    void testCheckoutDerivesCustomerIdentityFromAuthentication() throws Exception {
        // Setup cart for customer A
        Cart cartA = cartRepository.save(Cart.builder().customer(customerA).build());
        cartA.getCartItems().add(CartItem.builder()
                .cart(cartA)
                .menuItem(testMenuItem)
                .quantity(2)
                .build());
        cartRepository.save(cartA);

        CheckoutRequest request = CheckoutRequest.builder()
                .customerId(customerB.getId()) // Attacker sends customer B's ID
                .deliveryAddress("123 Main St, Apartment 4")
                .build();

        mockMvc.perform(post("/api/orders/checkout")
                        .header("Authorization", "Bearer " + tokenCustomerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customerId").value(customerA.getId())); // Enforced to Customer A!
    }

    @Test
    @DisplayName("Delivery Partner A can view own assigned deliveries via /me/orders")
    void testDeliveryPartnerCanViewAssignedOrders() throws Exception {
        orderRepository.save(Order.builder()
                .customer(customerA)
                .deliveryPartner(deliveryPartnerA)
                .deliveryAddress("789 Oak Ave")
                .totalAmount(new BigDecimal("30.00"))
                .status(OrderStatus.OUT_FOR_DELIVERY)
                .paymentStatus(PaymentStatus.PAID)
                .build());

        mockMvc.perform(get("/api/delivery-partners/me/orders")
                        .header("Authorization", "Bearer " + tokenDeliveryA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @DisplayName("Delivery Partner A cannot update another partner's assigned delivery order")
    void testDeliveryPartnerCannotUpdateOtherPartnerDelivery() throws Exception {
        Order orderForPartnerB = orderRepository.save(Order.builder()
                .customer(customerA)
                .deliveryPartner(deliveryPartnerB)
                .deliveryAddress("999 Pine St")
                .totalAmount(new BigDecimal("40.00"))
                .status(OrderStatus.OUT_FOR_DELIVERY)
                .paymentStatus(PaymentStatus.PAID)
                .build());

        // Partner A attempts to update Partner B's order
        mockMvc.perform(put("/api/orders/" + orderForPartnerB.getId() + "/delivery-status?status=DELIVERED")
                        .header("Authorization", "Bearer " + tokenDeliveryA))
                .andExpect(status().isBadRequest());
    }

    // =========================================================================
    // E. Account Provisioning Tests
    // =========================================================================

    @Test
    @DisplayName("Delivery-partner account provisioning is administrator-only")
    void testDeliveryPartnerProvisioningAdminOnly() throws Exception {
        String email = "courier-" + System.nanoTime() + "@flavorsexpress.com";
        Map<String, Object> req = Map.of(
                "name", "John Courier",
                "email", email,
                "phone", "9876500000",
                "status", "AVAILABLE",
                "password", "PartnerSecret123!"
        );

        // Customer attempts to provision partner -> 403 Forbidden
        mockMvc.perform(post("/api/delivery-partners")
                        .header("Authorization", "Bearer " + tokenCustomerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());

        // Admin provisions partner -> 201 Created
        mockMvc.perform(post("/api/delivery-partners")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.password").doesNotExist()); // Never returns password!

        // Verify linked login account was created
        Customer partnerAccount = customerRepository.findByEmail(email).orElseThrow();
        assertThat(partnerAccount.getRole()).isEqualTo(UserRole.DELIVERY_PARTNER);
        assertThat(passwordEncoder.matches("PartnerSecret123!", partnerAccount.getPassword())).isTrue();

        // Verify partner can log in using credentials
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "PartnerSecret123!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("DELIVERY_PARTNER"));
    }
}
