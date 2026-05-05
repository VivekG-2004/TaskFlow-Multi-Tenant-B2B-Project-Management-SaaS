package com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TenantRegistrationRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 100)
    private String companyName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Owner full name is required")
    private String fullName;
}