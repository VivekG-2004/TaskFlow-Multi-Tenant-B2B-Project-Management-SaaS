package com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.Tenant;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.TenantPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TenantPlanRepository extends JpaRepository<TenantPlan, Long> {
    Optional<TenantPlan> findByPlan(Tenant.Plan plan);
}