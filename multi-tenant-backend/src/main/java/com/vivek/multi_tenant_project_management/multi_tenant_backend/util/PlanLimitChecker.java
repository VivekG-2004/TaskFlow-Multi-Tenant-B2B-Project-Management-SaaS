package com.vivek.multi_tenant_project_management.multi_tenant_backend.util;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.config.TenantContext;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.PlanLimitExceededException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.Tenant;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.TenantPlan;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository.TenantPlanRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PlanLimitChecker {

    private final TenantRepository tenantRepository;
    private final TenantPlanRepository tenantPlanRepository;

    public void enforceProjectLimit(long currentCount) {
        TenantPlan plan = getPlan();
        if (plan.getMaxProjects() == -1) return;
        if (currentCount >= plan.getMaxProjects()) {
            throw new PlanLimitExceededException(
                    "Project limit reached for your plan. Current limit: " + plan.getMaxProjects()
            );
        }
    }

    public void enforceMemberLimit(long currentCount) {
        TenantPlan plan = getPlan();
        if (plan.getMaxMembers() == -1) return;
        if (currentCount >= plan.getMaxMembers()) {
            throw new PlanLimitExceededException(
                    "Member limit reached for your plan. Current limit: " + plan.getMaxMembers()
            );
        }
    }

    private TenantPlan getPlan() {
        String slug = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        return tenantPlanRepository.findByPlan(tenant.getPlan())
                .orElseThrow(() -> new RuntimeException("Plan not found"));
    }
}