package com.vivek.multi_tenant_project_management.multi_tenant_backend.exception;

public class PlanLimitExceededException extends RuntimeException {
    public PlanLimitExceededException(String message) {
        super(message);
    }
}