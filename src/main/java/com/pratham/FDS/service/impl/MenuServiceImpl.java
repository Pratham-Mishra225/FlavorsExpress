package com.pratham.FDS.service.impl;

import com.pratham.FDS.dto.MenuItemDTO;
import com.pratham.FDS.entity.Category;
import com.pratham.FDS.entity.MenuItem;
import com.pratham.FDS.exception.ResourceNotFoundException;
import com.pratham.FDS.mapper.MenuItemMapper;
import com.pratham.FDS.repository.CategoryRepository;
import com.pratham.FDS.repository.MenuRepository;
import com.pratham.FDS.service.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.pratham.FDS.dto.PagedResponse;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MenuServiceImpl implements MenuService {

    private final MenuRepository menuRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemMapper menuItemMapper;

    @Override
    public MenuItemDTO createMenuItem(MenuItemDTO menuItemDTO) {
        log.info("Creating menu item: {}", menuItemDTO.getName());
        Category category = categoryRepository.findById(menuItemDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", menuItemDTO.getCategoryId()));
        MenuItem menuItem = menuItemMapper.toEntity(menuItemDTO, category);
        MenuItem savedItem = menuRepository.save(menuItem);
        log.info("Menu item created successfully with ID: {}", savedItem.getId());
        return menuItemMapper.toDTO(savedItem);
    }

    @Override
    @Transactional(readOnly = true)
    public MenuItemDTO getMenuItemById(Long id) {
        log.info("Fetching menu item with ID: {}", id);
        MenuItem menuItem = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));
        return menuItemMapper.toDTO(menuItem);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemDTO> getAllMenuItems() {
        log.info("Fetching all menu items");
        return menuRepository.findAll()
                .stream()
                .map(menuItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<MenuItemDTO> getAllMenuItems(
            int page, int size, String sortBy, String sortDir, String search, Boolean isVegetarian) {
        log.info("Fetching menu items with pagination - page: {}, size: {}, sortBy: {}, sortDir: {}, search: {}, isVegetarian: {}",
                page, size, sortBy, sortDir, search, isVegetarian);
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? 
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Normalize empty search string to null
        String searchQuery = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<MenuItem> menuItemsPage = menuRepository.findByFilters(searchQuery, isVegetarian, pageable);

        List<MenuItemDTO> content = menuItemsPage.getContent()
                .stream()
                .map(menuItemMapper::toDTO)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                menuItemsPage.getNumber(),
                menuItemsPage.getSize(),
                menuItemsPage.getTotalElements(),
                menuItemsPage.getTotalPages(),
                menuItemsPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemDTO> getMenuItemsByCategory(Long categoryId) {
        log.info("Fetching menu items for category ID: {}", categoryId);
        // Validate category exists
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        return menuRepository.findByCategoryId(categoryId)
                .stream()
                .map(menuItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MenuItemDTO updateMenuItem(Long id, MenuItemDTO menuItemDTO) {
        log.info("Updating menu item with ID: {}", id);
        MenuItem existingItem = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));

        Category category = categoryRepository.findById(menuItemDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", menuItemDTO.getCategoryId()));

        existingItem.setName(menuItemDTO.getName());
        existingItem.setDescription(menuItemDTO.getDescription());
        existingItem.setPrice(menuItemDTO.getPrice());
        existingItem.setIsAvailable(menuItemDTO.getIsAvailable());
        existingItem.setCategory(category);

        MenuItem updatedItem = menuRepository.save(existingItem);
        log.info("Menu item updated successfully with ID: {}", updatedItem.getId());
        return menuItemMapper.toDTO(updatedItem);
    }

    @Override
    public void deleteMenuItem(Long id) {
        log.info("Deleting menu item with ID: {}", id);
        MenuItem menuItem = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));
        menuRepository.delete(menuItem);
        log.info("Menu item deleted successfully with ID: {}", id);
    }
}
