package com.vivek.multi_tenant_project_management.multi_tenant_backend.exception;

public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) {
        super(message);
    }
}