package com.pratham.FDS.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pratham.FDS.entity.Category;
import com.pratham.FDS.entity.MenuItem;
import com.pratham.FDS.repository.CategoryRepository;
import com.pratham.FDS.repository.MenuRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
public class MenuIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MenuRepository menuRepository;

    private Category italianCat;
    private Category drinksCat;
    private MenuItem itemMargherita;
    private MenuItem itemPepperoni;
    private MenuItem itemLemonade;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        italianCat = categoryRepository.save(Category.builder()
                .name("Italian Mains " + System.currentTimeMillis())
                .description("Authentic Italian items")
                .build());

        drinksCat = categoryRepository.save(Category.builder()
                .name("Cold Drinks " + System.currentTimeMillis())
                .description("Refreshing beverages")
                .build());

        itemMargherita = menuRepository.save(MenuItem.builder()
                .name("Classic Margherita")
                .description("San Marzano sauce and mozzarella")
                .price(new BigDecimal("12.50"))
                .isAvailable(true)
                .isVegetarian(true)
                .preparationTimeMinutes(15)
                .category(italianCat)
                .build());

        itemPepperoni = menuRepository.save(MenuItem.builder()
                .name("Spicy Pepperoni")
                .description("Spicy beef pepperoni with cheese")
                .price(new BigDecimal("14.00"))
                .isAvailable(true)
                .isVegetarian(false)
                .preparationTimeMinutes(18)
                .category(italianCat)
                .build());

        itemLemonade = menuRepository.save(MenuItem.builder()
                .name("Fresh Lemonade")
                .description("Freshly squeezed lemon drink")
                .price(new BigDecimal("4.00"))
                .isAvailable(false)
                .isVegetarian(true)
                .preparationTimeMinutes(5)
                .category(drinksCat)
                .build());
    }

    @Test
    @DisplayName("Public GET /api/categories returns existing categories")
    void testGetCategories() throws Exception {
        mockMvc.perform(get("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[*].name", hasItem(italianCat.getName())));
    }

    @Test
    @DisplayName("Public GET /api/menu-items returns paginated response structure")
    void testGetAllMenuItemsPaginated() throws Exception {
        mockMvc.perform(get("/api/menu-items")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements", greaterThan(0)))
                .andExpect(jsonPath("$.totalPages", greaterThan(0)));
    }

    @Test
    @DisplayName("Filter menu items by categoryId returns only items in that category")
    void testFilterByCategoryId() throws Exception {
        mockMvc.perform(get("/api/menu-items")
                        .param("categoryId", String.valueOf(italianCat.getId()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[*].categoryId", everyItem(equalTo(italianCat.getId().intValue()))));
    }

    @Test
    @DisplayName("Search menu items by query returns matching items")
    void testSearchMenuItems() throws Exception {
        mockMvc.perform(get("/api/menu-items")
                        .param("search", "Margherita")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].name").value("Classic Margherita"));
    }

    @Test
    @DisplayName("Filter by isVegetarian returns matching items")
    void testFilterVegetarian() throws Exception {
        mockMvc.perform(get("/api/menu-items")
                        .param("isVegetarian", "true")
                        .param("categoryId", String.valueOf(italianCat.getId()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[*].isVegetarian", everyItem(equalTo(true))));
    }

    @Test
    @DisplayName("Filter availableOnly=true excludes unavailable items")
    void testFilterAvailableOnly() throws Exception {
        mockMvc.perform(get("/api/menu-items")
                        .param("categoryId", String.valueOf(drinksCat.getId()))
                        .param("availableOnly", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", empty()));
    }

    @Test
    @DisplayName("GET /api/menu-items with invalid sort parameter falls back safely without HTTP 500")
    void testInvalidSortFallback() throws Exception {
        mockMvc.perform(get("/api/menu-items")
                        .param("sortBy", "nonExistentField123")
                        .param("sortDir", "asc")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())));
    }

    @Test
    @DisplayName("GET /api/menu-items with non-matching search returns empty content without error")
    void testSearchNoResultsReturnsEmptyContent() throws Exception {
        mockMvc.perform(get("/api/menu-items")
                        .param("search", "XYZNonExistentDish123456")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", empty()))
                .andExpect(jsonPath("$.totalElements").value(0));
    }
}
