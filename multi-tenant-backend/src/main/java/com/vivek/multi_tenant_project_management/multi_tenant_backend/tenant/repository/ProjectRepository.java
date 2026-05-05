package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByIsArchivedFalse();
    List<Project> findAll();
    long countByIsArchivedFalse();
}