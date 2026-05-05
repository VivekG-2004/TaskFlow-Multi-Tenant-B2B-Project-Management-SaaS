package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssigneeId(Long assigneeId);
    List<Task> findByParentId(Long parentId);
}