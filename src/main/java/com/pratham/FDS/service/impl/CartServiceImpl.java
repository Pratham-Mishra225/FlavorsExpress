package com.pratham.FDS.service.impl;

import com.pratham.FDS.dto.CartDTO;
import com.pratham.FDS.dto.CartItemDTO;
import com.pratham.FDS.dto.CartItemRequest;
import com.pratham.FDS.entity.Cart;
import com.pratham.FDS.entity.CartItem;
import com.pratham.FDS.entity.Customer;
import com.pratham.FDS.entity.MenuItem;
import com.pratham.FDS.exception.BadRequestException;
import com.pratham.FDS.exception.ResourceNotFoundException;
import com.pratham.FDS.mapper.CartItemMapper;
import com.pratham.FDS.repository.CartItemRepository;
import com.pratham.FDS.repository.CartRepository;
import com.pratham.FDS.repository.CustomerRepository;
import com.pratham.FDS.repository.MenuRepository;
import com.pratham.FDS.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final MenuRepository menuRepository;
    private final CartItemMapper cartItemMapper;

    // -------------------------------------------------------
    // Helper: find or auto-create a cart for the customer
    // -------------------------------------------------------
    private Cart getOrCreateCart(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));

        return cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    log.info("No cart found for customer {}. Auto-creating cart.", customerId);
                    Cart newCart = Cart.builder().customer(customer).build();
                    return cartRepository.save(newCart);
                });
    }

    // -------------------------------------------------------
    // Helper: build CartDTO with subtotal from a Cart entity
    // -------------------------------------------------------
    private CartDTO buildCartDTO(Cart cart) {
        List<CartItemDTO> itemDTOs = cart.getCartItems().stream()
                .map(cartItemMapper::toDTO)
                .collect(Collectors.toList());

        BigDecimal subtotal = itemDTOs.stream()
                .filter(item -> item.getPrice() != null && item.getQuantity() != null)
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDTO.builder()
                .id(cart.getId())
                .customerId(cart.getCustomer().getId())
                .cartItems(itemDTOs)
                .subtotal(subtotal)
                .totalAmount(subtotal)
                .build();
    }

    // -------------------------------------------------------
    // Get cart (auto-creates if missing)
    // -------------------------------------------------------
    @Override
    @Transactional
    public CartDTO getCart(Long customerId) {
        log.info("Fetching cart for customer ID: {}", customerId);
        Cart cart = getOrCreateCart(customerId);
        return buildCartDTO(cart);
    }

    // -------------------------------------------------------
    // Add item — increment if already exists, else create new
    // -------------------------------------------------------
    @Override
    public CartDTO addItem(Long customerId, CartItemRequest request) {
        log.info("Adding menuItem {} to cart for customer {}", request.getMenuItemId(), customerId);

        if (request.getMenuItemId() == null) {
            throw new BadRequestException("Menu item ID is required");
        }
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }
        if (request.getQuantity() > 99) {
            throw new BadRequestException("Quantity cannot exceed 99");
        }

        Cart cart = getOrCreateCart(customerId);

        MenuItem menuItem = menuRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", request.getMenuItemId()));

        if (!Boolean.TRUE.equals(menuItem.getIsAvailable())) {
            throw new BadRequestException("Menu item '" + menuItem.getName() + "' is currently unavailable");
        }

        // Check if this menu item already exists in the cart
        Optional<CartItem> existingItem = cartItemRepository
                .findByCartIdAndMenuItemId(cart.getId(), menuItem.getId());

        if (existingItem.isPresent()) {
            CartItem cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            if (newQuantity > 99) {
                throw new BadRequestException("Maximum quantity of 99 reached for item: " + menuItem.getName());
            }
            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);
            log.info("Incremented quantity for cartItem {} to {}", cartItem.getId(), cartItem.getQuantity());
        } else {
            CartItem newCartItem = CartItem.builder()
                    .cart(cart)
                    .menuItem(menuItem)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newCartItem);
            cart.getCartItems().add(newCartItem);
            log.info("Created new cartItem for menuItem {}", menuItem.getId());
        }

        return buildCartDTO(cart);
    }

    // -------------------------------------------------------
    // Update quantity of a specific cart item
    // -------------------------------------------------------
    @Override
    public CartDTO updateItemQuantity(Long customerId, Long cartItemId, CartItemRequest request) {
        log.info("Updating cartItem {} quantity to {} for customer {}", cartItemId, request.getQuantity(), customerId);

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }
        if (request.getQuantity() > 99) {
            throw new BadRequestException("Quantity cannot exceed 99");
        }

        Cart cart = getOrCreateCart(customerId);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        // Validate the cart item belongs to this customer's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("CartItem", "id", cartItemId);
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);
        log.info("Updated cartItem {} quantity to {}", cartItemId, request.getQuantity());

        return buildCartDTO(cart);
    }

    // -------------------------------------------------------
    // Remove a single item from the cart
    // -------------------------------------------------------
    @Override
    public CartDTO removeItem(Long customerId, Long cartItemId) {
        log.info("Removing cartItem {} for customer {}", cartItemId, customerId);

        Cart cart = getOrCreateCart(customerId);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        // Validate the cart item belongs to this customer's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("CartItem", "id", cartItemId);
        }

        cart.getCartItems().removeIf(item -> item.getId().equals(cartItemId));
        cartItemRepository.delete(cartItem);
        log.info("Removed cartItem {} from cart {}", cartItemId, cart.getId());

        return buildCartDTO(cart);
    }

    // -------------------------------------------------------
    // Clear all items from the cart
    // -------------------------------------------------------
    @Override
    public void clearCart(Long customerId) {
        log.info("Clearing cart for customer {}", customerId);

        Cart cart = getOrCreateCart(customerId);
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        cart.getCartItems().clear();
        cartItemRepository.deleteAll(items);
        log.info("Cleared {} items from cart {}", items.size(), cart.getId());
    }
}
