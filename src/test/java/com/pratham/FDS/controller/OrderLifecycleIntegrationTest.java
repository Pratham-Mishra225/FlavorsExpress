package com.pratham.FDS.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pratham.FDS.dto.CheckoutRequest;
import com.pratham.FDS.dto.OrderDTO;
import com.pratham.FDS.entity.*;
import com.pratham.FDS.enums.*;
import com.pratham.FDS.repository.*;
import com.pratham.FDS.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
public class OrderLifecycleIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DeliveryPartnerRepository deliveryPartnerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private Customer customer1;
    private Customer customer2;
    private Customer adminUser;
    private Customer courierUserA;
    private Customer courierUserB;
    private DeliveryPartner courierPartnerA;
    private DeliveryPartner courierPartnerB;
    private MenuItem pizzaItem;
    private MenuItem burgerItem;

    private String tokenCustomer1;
    private String tokenCustomer2;
    private String tokenAdmin;
    private String tokenCourierA;
    private String tokenCourierB;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        long nano = System.nanoTime();

        // 1. Categories & Menu Items
        Category mainCat = categoryRepository.save(Category.builder()
                .name("Test Category " + nano)
                .description("Test Category Description")
                .build());

        pizzaItem = menuRepository.save(MenuItem.builder()
                .name("Woodfired Pizza " + nano)
                .description("Crispy crust with cheese")
                .price(new BigDecimal("14.50"))
                .isAvailable(true)
                .isVegetarian(true)
                .preparationTimeMinutes(15)
                .category(mainCat)
                .build());

        burgerItem = menuRepository.save(MenuItem.builder()
                .name("Juicy Burger " + nano)
                .description("Grilled patty burger")
                .price(new BigDecimal("9.00"))
                .isAvailable(true)
                .isVegetarian(false)
                .preparationTimeMinutes(10)
                .category(mainCat)
                .build());

        // 2. Customers
        customer1 = customerRepository.save(Customer.builder()
                .name("Alice Customer")
                .email("alice_" + nano + "@test.com")
                .password(passwordEncoder.encode("Secret123!"))
                .phone("9111111111")
                .role(UserRole.CUSTOMER)
                .build());

        customer2 = customerRepository.save(Customer.builder()
                .name("Bob Customer")
                .email("bob_" + nano + "@test.com")
                .password(passwordEncoder.encode("Secret123!"))
                .phone("9222222222")
                .role(UserRole.CUSTOMER)
                .build());

        // 3. Admin
        adminUser = customerRepository.save(Customer.builder()
                .name("Admin Manager")
                .email("admin_" + nano + "@test.com")
                .password(passwordEncoder.encode("AdminSecret123!"))
                .phone("9333333333")
                .role(UserRole.ADMIN)
                .build());

        // 4. Delivery Partners
        courierUserA = customerRepository.save(Customer.builder()
                .name("Rider Dave")
                .email("dave_" + nano + "@test.com")
                .password(passwordEncoder.encode("RiderSecret123!"))
                .phone("9444444444")
                .role(UserRole.DELIVERY_PARTNER)
                .build());

        courierPartnerA = deliveryPartnerRepository.save(DeliveryPartner.builder()
                .name("Rider Dave")
                .email(courierUserA.getEmail())
                .phone("9444444444")
                .status(DeliveryPartnerStatus.AVAILABLE)
                .userAccount(courierUserA)
                .build());

        courierUserB = customerRepository.save(Customer.builder()
                .name("Rider Eve")
                .email("eve_" + nano + "@test.com")
                .password(passwordEncoder.encode("RiderSecret123!"))
                .phone("9555555555")
                .role(UserRole.DELIVERY_PARTNER)
                .build());

        courierPartnerB = deliveryPartnerRepository.save(DeliveryPartner.builder()
                .name("Rider Eve")
                .email(courierUserB.getEmail())
                .phone("9555555555")
                .status(DeliveryPartnerStatus.AVAILABLE)
                .userAccount(courierUserB)
                .build());

        // 5. JWT Tokens
        tokenCustomer1 = jwtUtil.generateToken(customer1);
        tokenCustomer2 = jwtUtil.generateToken(customer2);
        tokenAdmin = jwtUtil.generateToken(adminUser);
        tokenCourierA = jwtUtil.generateToken(courierUserA);
        tokenCourierB = jwtUtil.generateToken(courierUserB);
    }

    @Test
    @DisplayName("Scenario 1: Customer manages cart, adds items, updates quantities and calculates correct subtotal")
    void testCartOperations() throws Exception {
        // Add Pizza x2
        mockMvc.perform(post("/api/cart/" + customer1.getId() + "/items")
                        .header("Authorization", "Bearer " + tokenCustomer1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("menuItemId", pizzaItem.getId(), "quantity", 2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.totalAmount").value(29.00));

        // Add Burger x1
        mockMvc.perform(post("/api/cart/" + customer1.getId() + "/items")
                        .header("Authorization", "Bearer " + tokenCustomer1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("menuItemId", burgerItem.getId(), "quantity", 1))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.totalAmount").value(38.00));
    }

    @Test
    @DisplayName("Scenario 2 & 3: Checkout creates persistent order with PLACED status and clears cart; failed checkout leaves cart intact")
    void testCheckoutAndCartClearing() throws Exception {
        // Add items to Customer 1's cart
        mockMvc.perform(post("/api/cart/" + customer1.getId() + "/items")
                        .header("Authorization", "Bearer " + tokenCustomer1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("menuItemId", pizzaItem.getId(), "quantity", 2))))
                .andExpect(status().isOk());

        // Attempt checkout with empty delivery address -> fails validation, no order created
        mockMvc.perform(post("/api/orders/checkout")
                        .header("Authorization", "Bearer " + tokenCustomer1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("customerId", customer1.getId(), "deliveryAddress", ""))))
                .andExpect(status().isBadRequest());

        // Verify cart is still intact
        mockMvc.perform(get("/api/cart/" + customer1.getId())
                        .header("Authorization", "Bearer " + tokenCustomer1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1));

        // Successful checkout
        CheckoutRequest validRequest = CheckoutRequest.builder()
                .customerId(customer1.getId())
                .deliveryAddress("123 Maple Street, City Center")
                .build();

        MvcResult result = mockMvc.perform(post("/api/orders/checkout")
                        .header("Authorization", "Bearer " + tokenCustomer1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PLACED"))
                .andExpect(jsonPath("$.totalAmount").value(29.00))
                .andExpect(jsonPath("$.customerName").value("Alice Customer"))
                .andExpect(jsonPath("$.orderItems.length()").value(1))
                .andReturn();

        OrderDTO createdOrder = objectMapper.readValue(result.getResponse().getContentAsString(), OrderDTO.class);
        assertThat(createdOrder.getId()).isNotNull();

        // Cart is now cleared in database
        mockMvc.perform(get("/api/cart/" + customer1.getId())
                        .header("Authorization", "Bearer " + tokenCustomer1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0));

        // Order is persisted in DB
        Order persisted = orderRepository.findById(createdOrder.getId()).orElseThrow();
        assertThat(persisted.getStatus()).isEqualTo(OrderStatus.PLACED);
        assertThat(persisted.getTotalAmount()).isEqualByComparingTo("29.00");
    }

    @Test
    @DisplayName("Scenario 4: Customer cannot view another customer's order (Access Denied 403)")
    void testCustomerCannotAccessOtherCustomerOrder() throws Exception {
        // Create an order for Customer 1
        Order order1 = orderRepository.save(Order.builder()
                .customer(customer1)
                .deliveryAddress("123 Maple St")
                .totalAmount(new BigDecimal("29.00"))
                .status(OrderStatus.PLACED)
                .paymentStatus(PaymentStatus.PENDING)
                .build());

        // Customer 2 attempts to view Customer 1's order -> 403 Forbidden
        mockMvc.perform(get("/api/orders/" + order1.getId())
                        .header("Authorization", "Bearer " + tokenCustomer2))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Scenario 5, 6, 7 & 8: Admin views orders, updates status to PREPARING, and assigns partner")
    void testAdminManagementAndAssignment() throws Exception {
        Order order = orderRepository.save(Order.builder()
                .customer(customer1)
                .deliveryAddress("777 Broadway Ave")
                .totalAmount(new BigDecimal("50.00"))
                .status(OrderStatus.PLACED)
                .paymentStatus(PaymentStatus.PENDING)
                .build());

        // Admin retrieves all orders
        mockMvc.perform(get("/api/orders")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(1)));

        // Admin updates status PLACED -> PREPARING
        mockMvc.perform(put("/api/orders/" + order.getId() + "/status?status=PREPARING")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PREPARING"));

        // Admin auto-assigns an available partner
        mockMvc.perform(put("/api/orders/" + order.getId() + "/assign-automatic")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deliveryPartnerId").value(courierPartnerA.getId()))
                .andExpect(jsonPath("$.deliveryPartnerName").value(courierPartnerA.getName()));

        // Verify partner status became BUSY
        DeliveryPartner partnerCheck = deliveryPartnerRepository.findById(courierPartnerA.getId()).orElseThrow();
        assertThat(partnerCheck.getStatus()).isEqualTo(DeliveryPartnerStatus.BUSY);
    }

    @Test
    @DisplayName("Scenario 9, 10, 11 & 12: Delivery partner assigned orders, status updates, and ownership restriction")
    void testDeliveryPartnerWorkflowAndSecurity() throws Exception {
        // Order assigned to Partner A
        Order orderA = orderRepository.save(Order.builder()
                .customer(customer1)
                .deliveryPartner(courierPartnerA)
                .deliveryAddress("456 Elm St")
                .totalAmount(new BigDecimal("30.00"))
                .status(OrderStatus.PREPARING)
                .paymentStatus(PaymentStatus.PAID)
                .build());

        // Partner A views assigned deliveries
        mockMvc.perform(get("/api/delivery-partners/me/orders")
                        .header("Authorization", "Bearer " + tokenCourierA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(orderA.getId()));

        // Partner B tries to update Partner A's order -> Rejected (400 Bad Request)
        mockMvc.perform(put("/api/orders/" + orderA.getId() + "/delivery-status?status=OUT_FOR_DELIVERY")
                        .header("Authorization", "Bearer " + tokenCourierB))
                .andExpect(status().isBadRequest());

        // Partner A marks order OUT_FOR_DELIVERY
        mockMvc.perform(put("/api/orders/" + orderA.getId() + "/delivery-status?status=OUT_FOR_DELIVERY")
                        .header("Authorization", "Bearer " + tokenCourierA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OUT_FOR_DELIVERY"));

        // Partner A marks order DELIVERED
        mockMvc.perform(put("/api/orders/" + orderA.getId() + "/delivery-status?status=DELIVERED")
                        .header("Authorization", "Bearer " + tokenCourierA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"));

        // Verify Partner A is freed back to AVAILABLE
        DeliveryPartner freedPartner = deliveryPartnerRepository.findById(courierPartnerA.getId()).orElseThrow();
        assertThat(freedPartner.getStatus()).isEqualTo(DeliveryPartnerStatus.AVAILABLE);
    }

    @Test
    @DisplayName("Scenario 13: Enforce valid state transitions (reject invalid transitions)")
    void testInvalidTransitionsRejected() throws Exception {
        // 1. Order in PLACED cannot jump directly to DELIVERED
        Order placedOrder = orderRepository.save(Order.builder()
                .customer(customer1)
                .deliveryAddress("101 Park Ave")
                .totalAmount(new BigDecimal("25.00"))
                .status(OrderStatus.PLACED)
                .paymentStatus(PaymentStatus.PENDING)
                .build());

        mockMvc.perform(put("/api/orders/" + placedOrder.getId() + "/status?status=DELIVERED")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isBadRequest());

        // 2. Order in PREPARING cannot move to OUT_FOR_DELIVERY without an assigned delivery partner
        Order prepWithoutPartner = orderRepository.save(Order.builder()
                .customer(customer1)
                .deliveryAddress("102 Park Ave")
                .totalAmount(new BigDecimal("25.00"))
                .status(OrderStatus.PREPARING)
                .paymentStatus(PaymentStatus.PENDING)
                .build());

        mockMvc.perform(put("/api/orders/" + prepWithoutPartner.getId() + "/status?status=OUT_FOR_DELIVERY")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isBadRequest());

        // 3. Order in DELIVERED cannot revert to PREPARING
        Order deliveredOrder = orderRepository.save(Order.builder()
                .customer(customer1)
                .deliveryPartner(courierPartnerA)
                .deliveryAddress("103 Park Ave")
                .totalAmount(new BigDecimal("25.00"))
                .status(OrderStatus.DELIVERED)
                .paymentStatus(PaymentStatus.PAID)
                .build());

        mockMvc.perform(put("/api/orders/" + deliveredOrder.getId() + "/status?status=PREPARING")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Complete End-to-End Acceptance Test: PLACED -> PREPARING -> Assign Partner -> OUT_FOR_DELIVERY -> DELIVERED")
    void testCompleteOrderLifecycleFlow() throws Exception {
        // 1. Customer adds item to cart
        mockMvc.perform(post("/api/cart/" + customer1.getId() + "/items")
                        .header("Authorization", "Bearer " + tokenCustomer1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("menuItemId", pizzaItem.getId(), "quantity", 1))))
                .andExpect(status().isOk());

        // 2. Customer checks out
        MvcResult checkoutRes = mockMvc.perform(post("/api/orders/checkout")
                        .header("Authorization", "Bearer " + tokenCustomer1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("deliveryAddress", "99 University Lane"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PLACED"))
                .andReturn();

        OrderDTO order = objectMapper.readValue(checkoutRes.getResponse().getContentAsString(), OrderDTO.class);
        Long orderId = order.getId();

        // 3. Customer tracks order -> status is PLACED
        mockMvc.perform(get("/api/orders/" + orderId)
                        .header("Authorization", "Bearer " + tokenCustomer1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PLACED"));

        // 4. Admin moves status from PLACED to PREPARING
        mockMvc.perform(put("/api/orders/" + orderId + "/status?status=PREPARING")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PREPARING"));

        // 5. Admin manually assigns Courier A
        mockMvc.perform(put("/api/orders/" + orderId + "/assign-manual/" + courierPartnerA.getId())
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deliveryPartnerId").value(courierPartnerA.getId()));

        // 6. Courier A sees assigned order
        mockMvc.perform(get("/api/delivery-partners/me/orders")
                        .header("Authorization", "Bearer " + tokenCourierA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(orderId));

        // 7. Courier A marks order OUT_FOR_DELIVERY
        mockMvc.perform(put("/api/orders/" + orderId + "/delivery-status?status=OUT_FOR_DELIVERY")
                        .header("Authorization", "Bearer " + tokenCourierA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OUT_FOR_DELIVERY"));

        // 8. Courier A marks order DELIVERED
        mockMvc.perform(put("/api/orders/" + orderId + "/delivery-status?status=DELIVERED")
                        .header("Authorization", "Bearer " + tokenCourierA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"));

        // 9. Customer views order -> status is DELIVERED
        mockMvc.perform(get("/api/orders/" + orderId)
                        .header("Authorization", "Bearer " + tokenCustomer1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"))
                .andExpect(jsonPath("$.deliveryPartnerName").value(courierPartnerA.getName()));

        // 10. Partner A is verified AVAILABLE again in MySQL
        DeliveryPartner partnerFinal = deliveryPartnerRepository.findById(courierPartnerA.getId()).orElseThrow();
        assertThat(partnerFinal.getStatus()).isEqualTo(DeliveryPartnerStatus.AVAILABLE);
    }
}
