package com.pratham.FDS.dto;

import java.util.List;

/**
 * Generic paginated response wrapper for REST API endpoints.
 *
 * @param <T> the type of content in the page
 */
public record PagedResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {}
