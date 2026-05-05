package com.vivek.multi_tenant_project_management.multi_tenant_backend.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}