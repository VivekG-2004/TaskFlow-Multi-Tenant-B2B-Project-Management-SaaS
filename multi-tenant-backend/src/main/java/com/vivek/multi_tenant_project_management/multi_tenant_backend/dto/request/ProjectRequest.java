package com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(max = 100)
    private String name;

    private String description;
    private LocalDate startDate;
    private LocalDate dueDate;
    private String status;
}