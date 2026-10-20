package com.pratham.FDS.repository;

import com.pratham.FDS.entity.Category;
import com.pratham.FDS.entity.Customer;
import com.pratham.FDS.entity.MenuItem;
import com.pratham.FDS.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class DatabaseRestartPersistenceIntegrationTest {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MenuRepository menuRepository;

    @Test
    @DisplayName("Verify committed data remains persisted and retrievable across transactions")
    void testCommittedDataPersistence() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String email = "persistent_" + uniqueSuffix + "@college-fds.edu";

        // 1. Commit Customer to MySQL
        Customer customer = Customer.builder()
                .name("Persistent Student " + uniqueSuffix)
                .email(email)
                .password("$2a$10$hashedPasswordHere123")
                .phone("911" + uniqueSuffix.replaceAll("[^0-9]", "9").substring(0, 7))
                .role(UserRole.CUSTOMER)
                .build();

        Customer savedCustomer = customerRepository.saveAndFlush(customer);
        Long customerId = savedCustomer.getId();
        assertThat(customerId).isNotNull();

        // 2. Commit Category & Menu item to MySQL
        Category category = Category.builder()
                .name("PermanentCat_" + uniqueSuffix)
                .description("Permanent category to verify persistence")
                .build();
        Category savedCat = categoryRepository.saveAndFlush(category);

        MenuItem item = MenuItem.builder()
                .name("Permanent Dish " + uniqueSuffix)
                .description("Persisted dish across restarts")
                .price(new BigDecimal("199.99"))
                .isAvailable(true)
                .isVegetarian(true)
                .preparationTimeMinutes(10)
                .category(savedCat)
                .build();
        MenuItem savedItem = menuRepository.saveAndFlush(item);
        Long itemId = savedItem.getId();

        // 3. Query afresh from database
        Optional<Customer> reloadedCustomer = customerRepository.findById(customerId);
        assertThat(reloadedCustomer).isPresent();
        assertThat(reloadedCustomer.get().getEmail()).isEqualTo(email);

        Optional<MenuItem> reloadedItem = menuRepository.findById(itemId);
        assertThat(reloadedItem).isPresent();
        assertThat(reloadedItem.get().getName()).isEqualTo("Permanent Dish " + uniqueSuffix);

        // 4. Clean up the committed test entities to prevent test pollution
        menuRepository.deleteById(itemId);
        categoryRepository.deleteById(savedCat.getId());
        customerRepository.deleteById(customerId);

        assertThat(customerRepository.findById(customerId)).isEmpty();
        assertThat(menuRepository.findById(itemId)).isEmpty();
    }
}
