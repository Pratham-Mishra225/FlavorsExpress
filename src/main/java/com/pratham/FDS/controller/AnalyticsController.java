package com.pratham.FDS.controller;

import com.pratham.FDS.dto.AdminAnalyticsDTO;
import com.pratham.FDS.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for retrieving business dashboard analytics.
 */
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics Controller", description = "Endpoints for administrator business analytics and performance tracking")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/admin")
    @Operation(summary = "Get admin dashboard metrics", description = "Admin only. Returns aggregated business KPIs, order status counts, and top-selling menu items.")
    @ApiResponse(responseCode = "200", description = "Analytics generated successfully")
    public ResponseEntity<AdminAnalyticsDTO> getAdminAnalytics() {
        return ResponseEntity.ok(analyticsService.getAdminAnalytics());
    }
}
