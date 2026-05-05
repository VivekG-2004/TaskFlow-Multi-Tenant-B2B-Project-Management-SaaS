package com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tenant_plans")
public class TenantPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private Tenant.Plan plan;

    @Column(name = "max_projects", nullable = false)
    private Integer maxProjects;

    @Column(name = "max_members", nullable = false)
    private Integer maxMembers;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}