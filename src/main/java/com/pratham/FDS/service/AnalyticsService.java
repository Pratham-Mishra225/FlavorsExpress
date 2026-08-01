package com.pratham.FDS.service;

import com.pratham.FDS.dto.AdminAnalyticsDTO;

/**
 * Service interface for fetching dashboard analytics metrics.
 */
public interface AnalyticsService {

    /**
     * Aggregates and returns core admin analytics.
     * Includes order volumes, revenues, top items, and partner counts.
     *
     * @return the dashboard analytics DTO
     */
    AdminAnalyticsDTO getAdminAnalytics();
}
