package com.vivek.multi_tenant_project_management.multi_tenant_backend.master.service;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.LoginRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.UnauthorizedAccessException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.Tenant;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository.SuperAdminRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository.TenantRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final SuperAdminRepository superAdminRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public Map<String, Object> login(LoginRequest request) {
        var superAdmin = superAdminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedAccessException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), superAdmin.getPassword())) {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        String token = jwtUtil.generateSuperAdminToken(superAdmin.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("email", superAdmin.getEmail());
        return response;
    }

    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    public Tenant suspendTenant(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        tenant.setIsActive(false);
        tenant.setSuspendedAt(LocalDateTime.now());
        tenant.setUpdatedAt(LocalDateTime.now());
        return tenantRepository.save(tenant);
    }

    public Tenant reactivateTenant(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        tenant.setIsActive(true);
        tenant.setSuspendedAt(null);
        tenant.setUpdatedAt(LocalDateTime.now());
        return tenantRepository.save(tenant);
    }

    public Map<String, Object> getPlatformStats() {
        long totalTenants = tenantRepository.count();
        long activeTenants = tenantRepository.findAll()
                .stream().filter(Tenant::getIsActive).count();
        long freeTenants = tenantRepository.findAll()
                .stream().filter(t -> t.getPlan() == Tenant.Plan.FREE).count();
        long proTenants = tenantRepository.findAll()
                .stream().filter(t -> t.getPlan() == Tenant.Plan.PRO).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTenants", totalTenants);
        stats.put("activeTenants", activeTenants);
        stats.put("suspendedTenants", totalTenants - activeTenants);
        stats.put("freePlanTenants", freeTenants);
        stats.put("proPlanTenants", proTenants);
        return stats;
    }
}