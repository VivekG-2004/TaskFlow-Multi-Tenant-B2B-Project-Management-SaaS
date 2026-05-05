package com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String priority;
    private LocalDate dueDate;
    private Long assigneeId;
    private Long parentId;

    @NotNull(message = "Project ID is required")
    private Long projectId;
}