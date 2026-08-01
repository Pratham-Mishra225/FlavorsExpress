package com.pratham.FDS.mapper;

import com.pratham.FDS.dto.MenuItemDTO;
import com.pratham.FDS.entity.Category;
import com.pratham.FDS.entity.MenuItem;
import org.springframework.stereotype.Component;

/**
 * Maps between {@link MenuItem} entity and {@link MenuItemDTO}.
 */
@Component
public class MenuItemMapper {

    /**
     * Converts a {@link MenuItem} entity to a {@link MenuItemDTO}.
     * Includes {@code isVegetarian}, {@code preparationTimeMinutes}, and {@code categoryName} for display.
     *
     * @param menuItem the entity to convert; returns {@code null} if input is {@code null}
     */
    public MenuItemDTO toDTO(MenuItem menuItem) {
        if (menuItem == null) {
            return null;
        }
        return MenuItemDTO.builder()
                .id(menuItem.getId())
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .price(menuItem.getPrice())
                .isAvailable(menuItem.getIsAvailable())
                .isVegetarian(menuItem.getIsVegetarian())
                .preparationTimeMinutes(menuItem.getPreparationTimeMinutes())
                .categoryId(menuItem.getCategory() != null ? menuItem.getCategory().getId() : null)
                .categoryName(menuItem.getCategory() != null ? menuItem.getCategory().getName() : null)
                .build();
    }

    /**
     * Converts a {@link MenuItemDTO} to a {@link MenuItem} entity.
     *
     * @param dto      the DTO to convert; returns {@code null} if input is {@code null}
     * @param category the resolved {@link Category} entity for this item
     */
    public MenuItem toEntity(MenuItemDTO dto, Category category) {
        if (dto == null) {
            return null;
        }
        return MenuItem.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .isAvailable(dto.getIsAvailable())
                .isVegetarian(dto.getIsVegetarian() != null ? dto.getIsVegetarian() : false)
                .preparationTimeMinutes(dto.getPreparationTimeMinutes() != null ? dto.getPreparationTimeMinutes() : 15)
                .category(category)
                .build();
    }
}
