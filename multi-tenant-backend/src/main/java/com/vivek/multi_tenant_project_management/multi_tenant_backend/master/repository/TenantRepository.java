package com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    Optional<Tenant> findBySlug(String slug);
    Optional<Tenant> findByEmail(String email);
    boolean existsBySlug(String slug);
    boolean existsByEmail(String email);
}