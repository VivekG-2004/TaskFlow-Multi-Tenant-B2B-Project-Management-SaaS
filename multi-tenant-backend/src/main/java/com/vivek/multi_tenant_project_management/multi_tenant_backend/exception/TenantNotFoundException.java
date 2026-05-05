package com.vivek.multi_tenant_project_management.multi_tenant_backend.exception;

public class TenantNotFoundException extends RuntimeException {
    public TenantNotFoundException(String message) {
        super(message);
    }
}