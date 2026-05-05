package com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.SuperAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SuperAdminRepository extends JpaRepository<SuperAdmin, Long> {
    Optional<SuperAdmin> findByEmail(String email);
}