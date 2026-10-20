package com.pratham.FDS.service;

import com.pratham.FDS.dto.CartDTO;
import com.pratham.FDS.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
public class CartServiceTest {

    @Autowired
    private CartService cartService;

    @Test
    @DisplayName("Verify getCart retrieves cart for existing customer 9 without read-only error")
    void testGetCartForCustomer9() {
        CartDTO cart = cartService.getCart(9L);
        assertThat(cart).isNotNull();
        assertThat(cart.getCustomerId()).isEqualTo(9L);
        assertThat(cart.getId()).isNotNull();
        assertThat(cart.getCartItems()).isNotNull();
    }

    @Test
    @DisplayName("Verify getCart throws ResourceNotFoundException for nonexistent customer")
    void testGetCartForNonexistentCustomer() {
        assertThatThrownBy(() -> cartService.getCart(999999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Customer not found with id: '999999'");
    }
}
