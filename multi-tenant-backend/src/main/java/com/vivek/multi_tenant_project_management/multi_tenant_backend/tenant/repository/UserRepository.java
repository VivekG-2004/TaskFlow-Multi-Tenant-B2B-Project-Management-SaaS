package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}