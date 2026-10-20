package com.pratham.FDS.service;

import com.pratham.FDS.dto.CartDTO;
import com.pratham.FDS.dto.CartItemRequest;
import com.pratham.FDS.entity.Category;
import com.pratham.FDS.entity.Customer;
import com.pratham.FDS.entity.MenuItem;
import com.pratham.FDS.enums.UserRole;
import com.pratham.FDS.exception.BadRequestException;
import com.pratham.FDS.exception.ResourceNotFoundException;
import com.pratham.FDS.repository.CategoryRepository;
import com.pratham.FDS.repository.CustomerRepository;
import com.pratham.FDS.repository.MenuRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
public class CartServiceTest {

    @Autowired
    private CartService cartService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MenuRepository menuRepository;

    private Customer testCustomer;
    private Customer otherCustomer;
    private MenuItem availableItem1;
    private MenuItem availableItem2;
    private MenuItem unavailableItem;

    @BeforeEach
    void setUp() {
        testCustomer = customerRepository.save(Customer.builder()
                .name("Cart Test User")
                .email("cart.user." + System.currentTimeMillis() + "@test.com")
                .password("TestPassword123!")
                .phone("9123456789")
                .role(UserRole.CUSTOMER)
                .build());

        otherCustomer = customerRepository.save(Customer.builder()
                .name("Other Test User")
                .email("other.user." + System.currentTimeMillis() + "@test.com")
                .password("TestPassword123!")
                .phone("9123456788")
                .role(UserRole.CUSTOMER)
                .build());

        Category category = categoryRepository.save(Category.builder()
                .name("Test Category " + System.currentTimeMillis())
                .description("Test Category Description")
                .build());

        availableItem1 = menuRepository.save(MenuItem.builder()
                .name("Test Burger")
                .description("Juicy grilled burger")
                .price(new BigDecimal("10.00"))
                .isAvailable(true)
                .isVegetarian(false)
                .category(category)
                .build());

        availableItem2 = menuRepository.save(MenuItem.builder()
                .name("Test Fries")
                .description("Crispy seasoned fries")
                .price(new BigDecimal("5.00"))
                .isAvailable(true)
                .isVegetarian(true)
                .category(category)
                .build());

        unavailableItem = menuRepository.save(MenuItem.builder()
                .name("Sold Out Shake")
                .description("Creamy seasonal shake")
                .price(new BigDecimal("7.00"))
                .isAvailable(false)
                .isVegetarian(true)
                .category(category)
                .build());
    }

    @Test
    @DisplayName("Verify getCart auto-creates an empty cart with zero subtotal for new customer")
    void testGetCartCreatesEmptyCart() {
        CartDTO cart = cartService.getCart(testCustomer.getId());

        assertThat(cart).isNotNull();
        assertThat(cart.getCustomerId()).isEqualTo(testCustomer.getId());
        assertThat(cart.getCartItems()).isEmpty();
        assertThat(cart.getItems()).isEmpty();
        assertThat(cart.getSubtotal()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(cart.getTotalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Verify getCart throws ResourceNotFoundException for nonexistent customer")
    void testGetCartForNonexistentCustomer() {
        assertThatThrownBy(() -> cartService.getCart(999999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Customer not found with id: '999999'");
    }

    @Test
    @DisplayName("Verify adding available items sources price from DB and calculates item and cart subtotals")
    void testAddItemCalculatesSubtotalsFromDbPrice() {
        CartItemRequest request = CartItemRequest.builder()
                .menuItemId(availableItem1.getId())
                .quantity(2)
                .build();

        CartDTO cart = cartService.addItem(testCustomer.getId(), request);

        assertThat(cart.getCartItems()).hasSize(1);
        var item = cart.getCartItems().get(0);
        assertThat(item.getMenuItemId()).isEqualTo(availableItem1.getId());
        assertThat(item.getPrice()).isEqualByComparingTo(new BigDecimal("10.00"));
        assertThat(item.getQuantity()).isEqualTo(2);
        assertThat(item.getSubTotal()).isEqualByComparingTo(new BigDecimal("20.00"));
        assertThat(item.getSubtotal()).isEqualByComparingTo(new BigDecimal("20.00"));
        assertThat(cart.getSubtotal()).isEqualByComparingTo(new BigDecimal("20.00"));
        assertThat(cart.getTotalAmount()).isEqualByComparingTo(new BigDecimal("20.00"));

        // Add second distinct item
        CartItemRequest request2 = CartItemRequest.builder()
                .menuItemId(availableItem2.getId())
                .quantity(3)
                .build();

        CartDTO updatedCart = cartService.addItem(testCustomer.getId(), request2);

        assertThat(updatedCart.getCartItems()).hasSize(2);
        // Total = (2 * 10.00) + (3 * 5.00) = 35.00
        assertThat(updatedCart.getSubtotal()).isEqualByComparingTo(new BigDecimal("35.00"));
        assertThat(updatedCart.getTotalAmount()).isEqualByComparingTo(new BigDecimal("35.00"));
    }

    @Test
    @DisplayName("Verify adding an existing menu item merges quantity rather than duplicating entries")
    void testAddExistingItemIncrementsQuantity() {
        cartService.addItem(testCustomer.getId(), CartItemRequest.builder()
                .menuItemId(availableItem1.getId())
                .quantity(2)
                .build());

        CartDTO cart = cartService.addItem(testCustomer.getId(), CartItemRequest.builder()
                .menuItemId(availableItem1.getId())
                .quantity(3)
                .build());

        assertThat(cart.getCartItems()).hasSize(1);
        var item = cart.getCartItems().get(0);
        assertThat(item.getQuantity()).isEqualTo(5);
        assertThat(item.getSubTotal()).isEqualByComparingTo(new BigDecimal("50.00"));
        assertThat(cart.getSubtotal()).isEqualByComparingTo(new BigDecimal("50.00"));
    }

    @Test
    @DisplayName("Verify adding an unavailable menu item is rejected with BadRequestException")
    void testAddUnavailableItemIsRejected() {
        CartItemRequest request = CartItemRequest.builder()
                .menuItemId(unavailableItem.getId())
                .quantity(1)
                .build();

        assertThatThrownBy(() -> cartService.addItem(testCustomer.getId(), request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("unavailable");
    }

    @Test
    @DisplayName("Verify adding a nonexistent menu item throws ResourceNotFoundException")
    void testAddNonexistentItemThrowsNotFound() {
        CartItemRequest request = CartItemRequest.builder()
                .menuItemId(888888L)
                .quantity(1)
                .build();

        assertThatThrownBy(() -> cartService.addItem(testCustomer.getId(), request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("MenuItem not found with id: '888888'");
    }

    @Test
    @DisplayName("Verify zero and negative quantities are rejected when adding or updating items")
    void testZeroAndNegativeQuantitiesRejected() {
        CartItemRequest zeroRequest = CartItemRequest.builder()
                .menuItemId(availableItem1.getId())
                .quantity(0)
                .build();

        assertThatThrownBy(() -> cartService.addItem(testCustomer.getId(), zeroRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Quantity must be greater than zero");

        CartItemRequest negativeRequest = CartItemRequest.builder()
                .menuItemId(availableItem1.getId())
                .quantity(-5)
                .build();

        assertThatThrownBy(() -> cartService.addItem(testCustomer.getId(), negativeRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Quantity must be greater than zero");
    }

    @Test
    @DisplayName("Verify updateItemQuantity recalculates item subtotal and cart total")
    void testUpdateItemQuantityRecalculatesTotals() {
        CartDTO cart = cartService.addItem(testCustomer.getId(), CartItemRequest.builder()
                .menuItemId(availableItem1.getId())
                .quantity(2)
                .build());

        Long cartItemId = cart.getCartItems().get(0).getId();

        CartDTO updatedCart = cartService.updateItemQuantity(testCustomer.getId(), cartItemId, CartItemRequest.builder()
                .quantity(5)
                .build());

        var item = updatedCart.getCartItems().get(0);
        assertThat(item.getQuantity()).isEqualTo(5);
        assertThat(item.getSubTotal()).isEqualByComparingTo(new BigDecimal("50.00"));
        assertThat(updatedCart.getSubtotal()).isEqualByComparingTo(new BigDecimal("50.00"));
    }

    @Test
    @DisplayName("Verify updateItemQuantity rejects modifying an item belonging to another customer's cart")
    void testUpdateItemBelongingToAnotherCartFails() {
        CartDTO otherCart = cartService.addItem(otherCustomer.getId(), CartItemRequest.builder()
                .menuItemId(availableItem1.getId())
                .quantity(1)
                .build());

        Long otherCartItemId = otherCart.getCartItems().get(0).getId();

        assertThatThrownBy(() -> cartService.updateItemQuantity(testCustomer.getId(), otherCartItemId, CartItemRequest.builder()
                .quantity(4)
                .build()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Verify removeItem removes item from cart and recalculates total")
    void testRemoveItem() {
        cartService.addItem(testCustomer.getId(), CartItemRequest.builder()
                .menuItemId(availableItem1.getId())
                .quantity(1)
                .build());

        CartDTO cart = cartService.addItem(testCustomer.getId(), CartItemRequest.builder()
                .menuItemId(availableItem2.getId())
                .quantity(2)
                .build());

        assertThat(cart.getCartItems()).hasSize(2);
        Long item1CartId = cart.getCartItems().stream()
                .filter(i -> i.getMenuItemId().equals(availableItem1.getId()))
                .findFirst().orElseThrow().getId();

        CartDTO updatedCart = cartService.removeItem(testCustomer.getId(), item1CartId);

        assertThat(updatedCart.getCartItems()).hasSize(1);
        assertThat(updatedCart.getCartItems().get(0).getMenuItemId()).isEqualTo(availableItem2.getId());
        assertThat(updatedCart.getSubtotal()).isEqualByComparingTo(new BigDecimal("10.00"));
    }

    @Test
    @DisplayName("Verify clearCart empties the cart and resets subtotal to zero")
    void testClearCart() {
        cartService.addItem(testCustomer.getId(), CartItemRequest.builder()
                .menuItemId(availableItem1.getId())
                .quantity(3)
                .build());

        cartService.clearCart(testCustomer.getId());

        CartDTO cart = cartService.getCart(testCustomer.getId());
        assertThat(cart.getCartItems()).isEmpty();
        assertThat(cart.getSubtotal()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(cart.getTotalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
