package com.pratham.FDS.config;

import com.pratham.FDS.entity.Category;
import com.pratham.FDS.entity.DeliveryPartner;
import com.pratham.FDS.entity.MenuItem;
import com.pratham.FDS.entity.PromoCode;
import com.pratham.FDS.enums.DeliveryPartnerStatus;
import com.pratham.FDS.repository.CategoryRepository;
import com.pratham.FDS.repository.DeliveryPartnerRepository;
import com.pratham.FDS.repository.MenuRepository;
import com.pratham.FDS.repository.PromoCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds realistic initial menu categories, items, and delivery data for local development.
 * Idempotent: Never creates duplicate records or overwrites existing user data on restart.
 * Safe: Excluded in production environments via @Profile("!prod").
 */
@Slf4j
@Component
@Order(10)
@Profile("!prod")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final MenuRepository menuRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final PromoCodeRepository promoCodeRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedMenuData();
        seedDeliveryPartners();
        seedPromoCodes();
    }

    private void seedMenuData() {
        if (categoryRepository.count() > 0 || menuRepository.count() > 0) {
            log.info("Menu data already exists ({} categories, {} items). Skipping seed data generation.",
                    categoryRepository.count(), menuRepository.count());
            return;
        }

        log.info("No menu items found in database. Initializing sample menu for local development...");

        // 1. Pizzas & Breads
        Category pizzaCat = categoryRepository.save(Category.builder()
                .name("Pizzas & Breads")
                .description("Artisanal hand-stretched pizzas and fresh oven-baked breads")
                .build());

        menuRepository.saveAll(List.of(
                MenuItem.builder()
                        .name("Margherita Pizza")
                        .description("San Marzano tomato sauce, fresh mozzarella, aromatic basil, and extra virgin olive oil.")
                        .price(new BigDecimal("12.99"))
                        .isVegetarian(true)
                        .isAvailable(true)
                        .preparationTimeMinutes(20)
                        .category(pizzaCat)
                        .build(),
                MenuItem.builder()
                        .name("Pepperoni Feast Pizza")
                        .description("Loaded with artisanal spiced beef pepperoni, mozzarella blend, and signature herb tomato sauce.")
                        .price(new BigDecimal("15.99"))
                        .isVegetarian(false)
                        .isAvailable(true)
                        .preparationTimeMinutes(22)
                        .category(pizzaCat)
                        .build(),
                MenuItem.builder()
                        .name("Garlic Herb Breadsticks")
                        .description("Warm parmesan-crusted breadsticks served with house marinara dip.")
                        .price(new BigDecimal("6.49"))
                        .isVegetarian(true)
                        .isAvailable(true)
                        .preparationTimeMinutes(12)
                        .category(pizzaCat)
                        .build()
        ));

        // 2. Burgers & Sandwiches
        Category burgerCat = categoryRepository.save(Category.builder()
                .name("Burgers & Sandwiches")
                .description("Juicy gourmet burgers and toasted chef-special sandwiches")
                .build());

        menuRepository.saveAll(List.of(
                MenuItem.builder()
                        .name("Classic Smash Cheeseburger")
                        .description("Double smashed beef patty, aged cheddar, pickles, grilled onions, and secret house sauce.")
                        .price(new BigDecimal("11.49"))
                        .isVegetarian(false)
                        .isAvailable(true)
                        .preparationTimeMinutes(15)
                        .category(burgerCat)
                        .build(),
                MenuItem.builder()
                        .name("Crispy Paneer Burger")
                        .description("Golden batter-fried cottage cheese steak, mint mayo, crunchy lettuce, and garden tomatoes.")
                        .price(new BigDecimal("9.99"))
                        .isVegetarian(true)
                        .isAvailable(true)
                        .preparationTimeMinutes(14)
                        .category(burgerCat)
                        .build(),
                MenuItem.builder()
                        .name("Smoked BBQ Bacon Burger")
                        .description("Prime beef patty, smoked bacon, gouda cheese, crispy onion rings, and tangy BBQ glaze.")
                        .price(new BigDecimal("13.99"))
                        .isVegetarian(false)
                        .isAvailable(true)
                        .preparationTimeMinutes(18)
                        .category(burgerCat)
                        .build()
        ));

        // 3. Main Course
        Category mainCat = categoryRepository.save(Category.builder()
                .name("Main Course")
                .description("Traditional entrees, aromatic curries, and fragrant rice bowls")
                .build());

        menuRepository.saveAll(List.of(
                MenuItem.builder()
                        .name("Butter Chicken with Naan")
                        .description("Tender chicken roasted in clay tandoor and simmered in a velvety tomato-butter gravy.")
                        .price(new BigDecimal("16.99"))
                        .isVegetarian(false)
                        .isAvailable(true)
                        .preparationTimeMinutes(25)
                        .category(mainCat)
                        .build(),
                MenuItem.builder()
                        .name("Paneer Tikka Masala")
                        .description("Char-grilled spiced paneer cubes simmered in a rich onion-tomato sauce with basmati rice.")
                        .price(new BigDecimal("14.49"))
                        .isVegetarian(true)
                        .isAvailable(true)
                        .preparationTimeMinutes(20)
                        .category(mainCat)
                        .build(),
                MenuItem.builder()
                        .name("Hyderabadi Chicken Biryani")
                        .description("Slow-cooked aromatic basmati rice layered with spiced marinated chicken, saffron, and mint.")
                        .price(new BigDecimal("15.49"))
                        .isVegetarian(false)
                        .isAvailable(true)
                        .preparationTimeMinutes(25)
                        .category(mainCat)
                        .build()
        ));

        // 4. Starters & Appetizers
        Category starterCat = categoryRepository.save(Category.builder()
                .name("Starters & Appetizers")
                .description("Crispy snacks, seasoned fries, and savory finger foods")
                .build());

        menuRepository.saveAll(List.of(
                MenuItem.builder()
                        .name("Truffle Parmesan Fries")
                        .description("Crispy shoestring fries tossed in white truffle oil, freshly shaved parmesan, and parsley.")
                        .price(new BigDecimal("6.99"))
                        .isVegetarian(true)
                        .isAvailable(true)
                        .preparationTimeMinutes(10)
                        .category(starterCat)
                        .build(),
                MenuItem.builder()
                        .name("Spicy Buffalo Wings")
                        .description("Crispy bone-in chicken wings tossed in fiery cayenne pepper sauce with cooling ranch dip.")
                        .price(new BigDecimal("9.99"))
                        .isVegetarian(false)
                        .isAvailable(true)
                        .preparationTimeMinutes(15)
                        .category(starterCat)
                        .build(),
                MenuItem.builder()
                        .name("Crispy Corn Bhel")
                        .description("Golden crispy sweet corn kernels tossed with fresh herbs, lime, and tangy chaat spices.")
                        .price(new BigDecimal("5.99"))
                        .isVegetarian(true)
                        .isAvailable(true)
                        .preparationTimeMinutes(8)
                        .category(starterCat)
                        .build()
        ));

        // 5. Desserts & Beverages
        Category dessertCat = categoryRepository.save(Category.builder()
                .name("Desserts & Beverages")
                .description("Freshly crafted desserts, coolers, and refreshing drinks")
                .build());

        menuRepository.saveAll(List.of(
                MenuItem.builder()
                        .name("Molten Chocolate Lava Cake")
                        .description("Warm dark chocolate cake with a gooey melting ganache center, dusted with powdered sugar.")
                        .price(new BigDecimal("6.99"))
                        .isVegetarian(true)
                        .isAvailable(true)
                        .preparationTimeMinutes(10)
                        .category(dessertCat)
                        .build(),
                MenuItem.builder()
                        .name("Mango Mint Cooler")
                        .description("Chilled sweet Alphonso mango puree with crushed fresh mint leaves, lime, and sparkling soda.")
                        .price(new BigDecimal("4.49"))
                        .isVegetarian(true)
                        .isAvailable(true)
                        .preparationTimeMinutes(5)
                        .category(dessertCat)
                        .build(),
                MenuItem.builder()
                        .name("New York Cheesecake")
                        .description("Silky smooth baked cream cheese over a buttery graham cracker crust with strawberry coulis.")
                        .price(new BigDecimal("7.49"))
                        .isVegetarian(true)
                        .isAvailable(true)
                        .preparationTimeMinutes(5)
                        .category(dessertCat)
                        .build()
        ));

        log.info("Successfully seeded 5 categories and 15 signature menu items.");
    }

    private void seedDeliveryPartners() {
        if (deliveryPartnerRepository.count() > 0) {
            return;
        }

        deliveryPartnerRepository.save(DeliveryPartner.builder()
                .name("Alex Morgan")
                .email("alex.delivery@flavorsexpress.com")
                .phone("9876543210")
                .status(DeliveryPartnerStatus.AVAILABLE)
                .build());

        log.info("Seeded initial delivery partner.");
    }

    private void seedPromoCodes() {
        if (promoCodeRepository.count() > 0) {
            return;
        }

        promoCodeRepository.save(PromoCode.builder()
                .code("WELCOME20")
                .discountPercentage(new BigDecimal("20.00"))
                .maxDiscountAmount(new BigDecimal("10.00"))
                .minOrderAmount(new BigDecimal("15.00"))
                .isActive(true)
                .expiryDate(LocalDateTime.now().plusYears(1))
                .usageLimit(500)
                .usedCount(0)
                .build());

        log.info("Seeded WELCOME20 promo code.");
    }
}
