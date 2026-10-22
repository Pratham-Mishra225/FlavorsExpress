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

import com.pratham.FDS.entity.Customer;
import com.pratham.FDS.enums.UserRole;
import com.pratham.FDS.repository.CustomerRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedMenuData();
        seedDeliveryPartners();
        seedPromoCodes();
    }

    private void seedMenuData() {
        Category pizzaCat = categoryRepository.findByName("Pizzas & Breads")
                .orElseGet(() -> categoryRepository.save(Category.builder()
                        .name("Pizzas & Breads")
                        .description("Artisanal hand-stretched pizzas and fresh oven-baked breads")
                        .build()));

        Category burgerCat = categoryRepository.findByName("Burgers & Sandwiches")
                .orElseGet(() -> categoryRepository.save(Category.builder()
                        .name("Burgers & Sandwiches")
                        .description("Juicy gourmet burgers and toasted chef-special sandwiches")
                        .build()));

        Category mainCat = categoryRepository.findByName("Main Course")
                .orElseGet(() -> categoryRepository.save(Category.builder()
                        .name("Main Course")
                        .description("Traditional entrees, aromatic curries, and fragrant rice bowls")
                        .build()));

        Category starterCat = categoryRepository.findByName("Starters & Appetizers")
                .orElseGet(() -> categoryRepository.save(Category.builder()
                        .name("Starters & Appetizers")
                        .description("Crispy snacks, seasoned fries, and savory finger foods")
                        .build()));

        Category dessertCat = categoryRepository.findByName("Desserts & Beverages")
                .orElseGet(() -> categoryRepository.save(Category.builder()
                        .name("Desserts & Beverages")
                        .description("Freshly crafted desserts, coolers, and refreshing drinks")
                        .build()));

        // Check if existing items have USD-style prices (under 40.00) or if database is empty
        boolean needsIndianMenu = menuRepository.count() == 0 ||
                menuRepository.findAll().stream().anyMatch(m -> m.getPrice().compareTo(new BigDecimal("40.00")) < 0);

        if (!needsIndianMenu) {
            log.info("Indian fast-food menu already configured with INR pricing ({} items). Skipping seed.", menuRepository.count());
            return;
        }

        log.info("Configuring authentic Indian fast-food menu with realistic INR prices...");

        // Map of target items
        record ItemSeed(String name, String desc, BigDecimal price, boolean isVeg, int prepTime, Category cat) {}
        List<ItemSeed> targetItems = List.of(
                // 1. Pizzas & Breads
                new ItemSeed("Tandoori Paneer Pizza", "Hand-stretched crust topped with spicy marinated paneer, capsicum, red onion, and mozzarella blend.", new BigDecimal("279.00"), true, 20, pizzaCat),
                new ItemSeed("Mumbai Masala Pizza", "Spiced potato-corn masala, green chutney swirl, crunchy bell peppers, and melted cheese.", new BigDecimal("249.00"), true, 18, pizzaCat),
                new ItemSeed("Masala Garlic Bread", "Crispy toasted French baguette brushed with garlic-herb butter and spiced chilli cheese.", new BigDecimal("129.00"), true, 12, pizzaCat),

                // 2. Burgers & Sandwiches
                new ItemSeed("Mumbai Vada Pav", "Authentic spiced potato batata vada in a soft pav with dry garlic-peanut chutney and fried green chilli.", new BigDecimal("69.00"), true, 8, burgerCat),
                new ItemSeed("Crispy Paneer Burger", "Golden batter-fried cottage cheese steak, mint mayo, crunchy lettuce, and garden tomatoes.", new BigDecimal("189.00"), true, 14, burgerCat),
                new ItemSeed("Aloo Tikki Burger", "Crisp spiced potato patty, tangy tamarind glaze, sliced onions, and cool mint yogurt sauce.", new BigDecimal("119.00"), true, 12, burgerCat),
                new ItemSeed("Chicken Tikka Burger", "Char-grilled smoky chicken tikka patty, tandoori spread, pickled onions, and melted cheese.", new BigDecimal("229.00"), false, 15, burgerCat),
                new ItemSeed("Masala Grilled Sandwich", "Triple-layer toasted sandwich stuffed with spiced potatoes, beetroot, cucumber, mint chutney, and Amul cheese.", new BigDecimal("149.00"), true, 10, burgerCat),

                // 3. Main Course
                new ItemSeed("Butter Chicken with Naan", "Tender chicken roasted in clay tandoor and simmered in a velvety tomato-butter gravy with butter naan.", new BigDecimal("349.00"), false, 25, mainCat),
                new ItemSeed("Paneer Tikka Rice Bowl", "Char-grilled spiced paneer cubes over fragrant cumin basmati rice with pickled onions and mint chutney.", new BigDecimal("249.00"), true, 20, mainCat),
                new ItemSeed("Hyderabadi Chicken Biryani", "Slow-cooked aromatic basmati rice layered with spiced marinated chicken, saffron, and cooling raita.", new BigDecimal("299.00"), false, 25, mainCat),
                new ItemSeed("Veg Biryani Bowl", "Dum-cooked long-grain basmati rice with garden vegetables, paneer, aromatic herbs, and roasted cashews.", new BigDecimal("219.00"), true, 20, mainCat),
                new ItemSeed("Chole Kulcha Meal", "Authentic Delhi-style spiced chickpea curry served with two soft buttered kulchas and tangy pickled onions.", new BigDecimal("179.00"), true, 15, mainCat),

                // 4. Starters & Appetizers
                new ItemSeed("Peri-Peri Fries", "Crispy golden shoestring fries tossed in fiery peri-peri seasoning and served with garlic dip.", new BigDecimal("119.00"), true, 10, starterCat),
                new ItemSeed("Pav Bhaji", "Rich and spicy mashed vegetable curry simmered with butter and spices, served with two toasted pav.", new BigDecimal("169.00"), true, 12, starterCat),
                new ItemSeed("Spicy Chicken Kathi Roll", "Flaky paratha wrapped around succulent marinated chicken tikka, sliced peppers, and mint chutney.", new BigDecimal("199.00"), false, 14, starterCat),
                new ItemSeed("Crispy Corn Bhel", "Golden crispy sweet corn kernels tossed with fresh herbs, lime, pomegranate, and tangy chaat spices.", new BigDecimal("129.00"), true, 8, starterCat),

                // 5. Desserts & Beverages
                new ItemSeed("Mango Lassi", "Thick and creamy chilled yogurt blended with sweet Alphonso mango pulp and a touch of cardamom.", new BigDecimal("89.00"), true, 5, dessertCat),
                new ItemSeed("Masala Chai", "Freshly brewed strong Indian milk tea infused with crushed ginger, green cardamom, and aromatic spices.", new BigDecimal("49.00"), true, 5, dessertCat),
                new ItemSeed("Gulab Jamun (2 pcs)", "Soft golden-brown cottage cheese dumplings soaked in warm saffron and cardamom sugar syrup.", new BigDecimal("79.00"), true, 5, dessertCat),
                new ItemSeed("Molten Chocolate Lava Cake", "Warm dark chocolate cake with a gooey melting ganache center, dusted with powdered sugar.", new BigDecimal("149.00"), true, 10, dessertCat),
                new ItemSeed("Cold Coffee with Ice Cream", "Rich blended espresso cold coffee topped with a creamy scoop of vanilla ice cream.", new BigDecimal("119.00"), true, 5, dessertCat)
        );

        List<MenuItem> existingList = menuRepository.findAll();
        for (int i = 0; i < targetItems.size(); i++) {
            ItemSeed seed = targetItems.get(i);
            if (i < existingList.size()) {
                // Update existing record in-place to preserve foreign key references
                MenuItem item = existingList.get(i);
                item.setName(seed.name());
                item.setDescription(seed.desc());
                item.setPrice(seed.price());
                item.setIsVegetarian(seed.isVeg());
                item.setPreparationTimeMinutes(seed.prepTime());
                item.setCategory(seed.cat());
                item.setIsAvailable(true);
                menuRepository.save(item);
            } else {
                // Create new record
                MenuItem item = MenuItem.builder()
                        .name(seed.name())
                        .description(seed.desc())
                        .price(seed.price())
                        .isVegetarian(seed.isVeg())
                        .isAvailable(true)
                        .preparationTimeMinutes(seed.prepTime())
                        .category(seed.cat())
                        .build();
                menuRepository.save(item);
            }
        }
        log.info("Successfully configured {} Indian fast-food menu items with INR pricing.", targetItems.size());
    }

    private void seedDeliveryPartners() {
        String partnerEmail = "alex.delivery@flavorsexpress.com";
        Customer partnerUser = customerRepository.findByEmail(partnerEmail)
                .orElseGet(() -> customerRepository.save(Customer.builder()
                        .name("Alex Morgan")
                        .email(partnerEmail)
                        .password(passwordEncoder.encode("DeliveryPass123!"))
                        .phone("9876543210")
                        .role(UserRole.DELIVERY_PARTNER)
                        .build()));

        var existingPartnerOpt = deliveryPartnerRepository.findByEmail(partnerEmail);
        if (existingPartnerOpt.isEmpty()) {
            deliveryPartnerRepository.save(DeliveryPartner.builder()
                    .name("Alex Morgan")
                    .email(partnerEmail)
                    .phone("9876543210")
                    .status(DeliveryPartnerStatus.AVAILABLE)
                    .userAccount(partnerUser)
                    .build());
            log.info("Seeded initial delivery partner linked to customer account.");
        } else {
            DeliveryPartner existing = existingPartnerOpt.get();
            if (existing.getUserAccount() == null) {
                existing.setUserAccount(partnerUser);
                deliveryPartnerRepository.save(existing);
                log.info("Linked existing delivery partner to customer account.");
            }
        }
    }

    private void seedPromoCodes() {
        var promoOpt = promoCodeRepository.findByCode("WELCOME20");
        if (promoOpt.isPresent()) {
            PromoCode promo = promoOpt.get();
            if (promo.getMaxDiscountAmount().compareTo(new BigDecimal("20.00")) <= 0) {
                promo.setMaxDiscountAmount(new BigDecimal("100.00"));
                promo.setMinOrderAmount(new BigDecimal("299.00"));
                promoCodeRepository.save(promo);
                log.info("Updated WELCOME20 promo code limits to realistic INR values (max ₹100, min ₹299).");
            }
            return;
        }

        promoCodeRepository.save(PromoCode.builder()
                .code("WELCOME20")
                .discountPercentage(new BigDecimal("20.00"))
                .maxDiscountAmount(new BigDecimal("100.00"))
                .minOrderAmount(new BigDecimal("299.00"))
                .isActive(true)
                .expiryDate(LocalDateTime.now().plusYears(1))
                .usageLimit(500)
                .usedCount(0)
                .build());

        log.info("Seeded WELCOME20 promo code with realistic INR limits.");
    }
}
