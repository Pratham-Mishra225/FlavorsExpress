package com.pratham.FDS.repository;

import com.pratham.FDS.entity.*;
import com.pratham.FDS.enums.DeliveryPartnerStatus;
import com.pratham.FDS.enums.OrderStatus;
import com.pratham.FDS.enums.PaymentStatus;
import com.pratham.FDS.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class RepositoryPersistenceIntegrationTest {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private DeliveryPartnerRepository deliveryPartnerRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Test
    @Transactional
    @DisplayName("Verify Customer persistence and retrieval by email")
    void testCustomerPersistence() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String email = "customer_" + uniqueSuffix + "@example.com";

        Customer customer = Customer.builder()
                .name("Test Customer")
                .email(email)
                .password("$2a$10$encodedPasswordHashForTesting123")
                .phone("999" + uniqueSuffix.replaceAll("[^0-9]", "0").substring(0, 7))
                .role(UserRole.CUSTOMER)
                .build();

        Customer saved = customerRepository.save(customer);
        assertThat(saved.getId()).isNotNull();

        Optional<Customer> retrieved = customerRepository.findByEmail(email);
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getName()).isEqualTo("Test Customer");
        assertThat(retrieved.get().getRole()).isEqualTo(UserRole.CUSTOMER);
        assertThat(retrieved.get().getCreatedAt()).isNotNull();
    }

    @Test
    @Transactional
    @DisplayName("Verify Category and MenuItem persistence with valid relations and BigDecimal precision")
    void testMenuItemPersistence() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);

        Category category = Category.builder()
                .name("Cat_" + uniqueSuffix)
                .description("Test Category Description")
                .build();
        Category savedCategory = categoryRepository.save(category);
        assertThat(savedCategory.getId()).isNotNull();

        MenuItem item = MenuItem.builder()
                .name("Test Margherita Pizza " + uniqueSuffix)
                .description("Delicious test pizza")
                .price(new BigDecimal("299.50"))
                .isAvailable(true)
                .isVegetarian(true)
                .preparationTimeMinutes(20)
                .category(savedCategory)
                .build();

        MenuItem savedItem = menuRepository.save(item);
        assertThat(savedItem.getId()).isNotNull();

        Optional<MenuItem> retrieved = menuRepository.findById(savedItem.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getPrice()).isEqualByComparingTo(new BigDecimal("299.50"));
        assertThat(retrieved.get().getCategory().getId()).isEqualTo(savedCategory.getId());
        assertThat(retrieved.get().getIsVegetarian()).isTrue();
    }

    @Test
    @Transactional
    @DisplayName("Verify DeliveryPartner persistence and status querying")
    void testDeliveryPartnerPersistence() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String phoneDigits = uniqueSuffix.replaceAll("[^0-9]", "1");
        while (phoneDigits.length() < 7) {
            phoneDigits += "0";
        }
        String phone = "888" + phoneDigits.substring(0, 7);

        DeliveryPartner partner = DeliveryPartner.builder()
                .name("Rider " + uniqueSuffix)
                .email("rider_" + uniqueSuffix + "@example.com")
                .phone(phone)
                .status(DeliveryPartnerStatus.AVAILABLE)
                .build();

        DeliveryPartner saved = deliveryPartnerRepository.save(partner);
        assertThat(saved.getId()).isNotNull();

        Optional<DeliveryPartner> retrieved = deliveryPartnerRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getStatus()).isEqualTo(DeliveryPartnerStatus.AVAILABLE);

        List<DeliveryPartner> availableList = deliveryPartnerRepository.findByStatus(DeliveryPartnerStatus.AVAILABLE);
        assertThat(availableList).anyMatch(p -> p.getId().equals(saved.getId()));
    }

    @Test
    @Transactional
    @DisplayName("Verify Cart and CartItem persistence with Customer and MenuItem associations")
    void testCartAndCartItemPersistence() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);

        Customer customer = customerRepository.save(Customer.builder()
                .name("Cart User " + uniqueSuffix)
                .email("cartuser_" + uniqueSuffix + "@example.com")
                .password("pwd12345")
                .phone("777" + uniqueSuffix.replaceAll("[^0-9]", "2").substring(0, 7))
                .role(UserRole.CUSTOMER)
                .build());

        Category category = categoryRepository.save(Category.builder()
                .name("CartCat_" + uniqueSuffix)
                .build());

        MenuItem item = menuRepository.save(MenuItem.builder()
                .name("Cart Burger " + uniqueSuffix)
                .price(new BigDecimal("149.00"))
                .isAvailable(true)
                .isVegetarian(false)
                .preparationTimeMinutes(15)
                .category(category)
                .build());

        Cart cart = Cart.builder()
                .customer(customer)
                .build();
        Cart savedCart = cartRepository.save(cart);
        assertThat(savedCart.getId()).isNotNull();

        CartItem cartItem = CartItem.builder()
                .cart(savedCart)
                .menuItem(item)
                .quantity(2)
                .build();
        CartItem savedCartItem = cartItemRepository.save(cartItem);
        assertThat(savedCartItem.getId()).isNotNull();

        List<CartItem> items = cartItemRepository.findByCartId(savedCart.getId());
        assertThat(items).hasSize(1);
        assertThat(items.get(0).getMenuItem().getId()).isEqualTo(item.getId());
        assertThat(items.get(0).getQuantity()).isEqualTo(2);
    }

    @Test
    @Transactional
    @DisplayName("Verify Order and OrderItem persistence with complete relationships")
    void testOrderAndOrderItemPersistence() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);

        Customer customer = customerRepository.save(Customer.builder()
                .name("Order User " + uniqueSuffix)
                .email("orderuser_" + uniqueSuffix + "@example.com")
                .password("pwd12345")
                .phone("666" + uniqueSuffix.replaceAll("[^0-9]", "3").substring(0, 7))
                .role(UserRole.CUSTOMER)
                .build());

        Category category = categoryRepository.save(Category.builder()
                .name("OrderCat_" + uniqueSuffix)
                .build());

        MenuItem item = menuRepository.save(MenuItem.builder()
                .name("Order Biryani " + uniqueSuffix)
                .price(new BigDecimal("350.00"))
                .isAvailable(true)
                .isVegetarian(false)
                .preparationTimeMinutes(25)
                .category(category)
                .build());

        DeliveryPartner partner = deliveryPartnerRepository.save(DeliveryPartner.builder()
                .name("Delivery Guy " + uniqueSuffix)
                .email("delivery_" + uniqueSuffix + "@example.com")
                .phone("555" + uniqueSuffix.replaceAll("[^0-9]", "4").substring(0, 7))
                .status(DeliveryPartnerStatus.AVAILABLE)
                .build());

        Order order = Order.builder()
                .customer(customer)
                .deliveryPartner(partner)
                .totalAmount(new BigDecimal("350.00"))
                .status(OrderStatus.PLACED)
                .paymentStatus(PaymentStatus.PAID)
                .deliveryAddress("123 Tech Campus, Hostels Block A")
                .estimatedDeliveryTime(LocalDateTime.now().plusMinutes(40))
                .build();

        Order savedOrder = orderRepository.save(order);
        assertThat(savedOrder.getId()).isNotNull();

        OrderItem orderItem = OrderItem.builder()
                .order(savedOrder)
                .menuItem(item)
                .quantity(1)
                .price(new BigDecimal("350.00"))
                .build();

        OrderItem savedOrderItem = orderItemRepository.save(orderItem);
        assertThat(savedOrderItem.getId()).isNotNull();

        List<Order> customerOrders = orderRepository.findByCustomerId(customer.getId());
        assertThat(customerOrders).hasSize(1);
        assertThat(customerOrders.get(0).getStatus()).isEqualTo(OrderStatus.PLACED);
        assertThat(customerOrders.get(0).getDeliveryPartner().getId()).isEqualTo(partner.getId());

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(savedOrder.getId());
        assertThat(orderItems).hasSize(1);
        assertThat(orderItems.get(0).getMenuItem().getName()).isEqualTo("Order Biryani " + uniqueSuffix);
        assertThat(orderItems.get(0).getPrice()).isEqualByComparingTo(new BigDecimal("350.00"));
    }
}
