package com.pratham.FDS.repository;

import com.pratham.FDS.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for {@link MenuItem} with support for pagination, search, and vegetarian filtering.
 */
@Repository
public interface MenuRepository extends JpaRepository<MenuItem, Long>, JpaSpecificationExecutor<MenuItem> {

    List<MenuItem> findByCategoryId(Long categoryId);

    List<MenuItem> findByIsAvailableTrue();

    List<MenuItem> findByCategoryIdAndIsAvailableTrue(Long categoryId);

    List<MenuItem> findByNameContainingIgnoreCase(String name);

    /**
     * Returns a paginated page of menu items filtered by name/description search, vegetarian flag, category, and availability.
     * All filter parameters are optional — passing {@code null} skips that filter.
     */
    @Query("""
            SELECT m FROM MenuItem m
            WHERE (:search IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:isVegetarian IS NULL OR m.isVegetarian = :isVegetarian)
              AND (:categoryId IS NULL OR m.category.id = :categoryId)
              AND (:availableOnly IS NULL OR :availableOnly = false OR m.isAvailable = true)
            """)
    Page<MenuItem> findByFilters(@Param("search") String search,
                                 @Param("isVegetarian") Boolean isVegetarian,
                                 @Param("categoryId") Long categoryId,
                                 @Param("availableOnly") Boolean availableOnly,
                                 Pageable pageable);

    /** Paginated lookup by vegetarian flag only. */
    Page<MenuItem> findByIsVegetarian(Boolean isVegetarian, Pageable pageable);
}
