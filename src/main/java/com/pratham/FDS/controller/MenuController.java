package com.pratham.FDS.controller;

import com.pratham.FDS.dto.MenuItemDTO;
import com.pratham.FDS.dto.PagedResponse;
import com.pratham.FDS.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
@RequiredArgsConstructor
@Tag(name = "Menu Controller", description = "Endpoints for browsing and managing menu items")
public class MenuController {

    private final MenuService menuService;

    @PostMapping
    @Operation(summary = "Create a menu item", description = "Admin only. Creates a new menu item.")
    @ApiResponse(responseCode = "201", description = "Menu item created")
    public ResponseEntity<MenuItemDTO> createMenuItem(@Valid @RequestBody MenuItemDTO menuItemDTO) {
        return new ResponseEntity<>(menuService.createMenuItem(menuItemDTO), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get menu item by ID")
    public ResponseEntity<MenuItemDTO> getMenuItemById(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getMenuItemById(id));
    }

    @GetMapping
    @Operation(summary = "Get all menu items (paginated + filtered)",
               description = "Public endpoint. Supports pagination, sorting, full-text search, and vegetarian filtering.")
    public ResponseEntity<PagedResponse<MenuItemDTO>> getAllMenuItems(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "12") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction: asc or desc") @RequestParam(defaultValue = "asc") String sortDir,
            @Parameter(description = "Search term for name/description") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by vegetarian flag") @RequestParam(required = false) Boolean isVegetarian) {
        return ResponseEntity.ok(menuService.getAllMenuItems(page, size, sortBy, sortDir, search, isVegetarian));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get menu items by category")
    public ResponseEntity<List<MenuItemDTO>> getMenuItemsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(menuService.getMenuItemsByCategory(categoryId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a menu item", description = "Admin only.")
    public ResponseEntity<MenuItemDTO> updateMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemDTO menuItemDTO) {
        return ResponseEntity.ok(menuService.updateMenuItem(id, menuItemDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a menu item", description = "Admin only.")
    @ApiResponse(responseCode = "204", description = "Menu item deleted")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}
