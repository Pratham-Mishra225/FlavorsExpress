package com.pratham.FDS.service;

import com.pratham.FDS.dto.MenuItemDTO;

import java.util.List;

public interface MenuService {

    MenuItemDTO createMenuItem(MenuItemDTO menuItemDTO);

    MenuItemDTO getMenuItemById(Long id);

    List<MenuItemDTO> getAllMenuItems();

    com.pratham.FDS.dto.PagedResponse<MenuItemDTO> getAllMenuItems(
            int page, int size, String sortBy, String sortDir, String search, Boolean isVegetarian);

    List<MenuItemDTO> getMenuItemsByCategory(Long categoryId);

    MenuItemDTO updateMenuItem(Long id, MenuItemDTO menuItemDTO);

    void deleteMenuItem(Long id);
}
