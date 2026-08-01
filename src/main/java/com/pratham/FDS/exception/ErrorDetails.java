package com.pratham.FDS.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Standard error response body returned by {@link GlobalExceptionHandler}.
 * Aligned with RFC-7807 spirit: includes timestamp, HTTP status, short error label,
 * human-readable message, and the request path.
 */
@Getter
@Setter
@AllArgsConstructor
public class ErrorDetails {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
}
