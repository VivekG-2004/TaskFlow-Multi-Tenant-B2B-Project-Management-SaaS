package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.TaskComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {
    List<TaskComment> findByTaskId(Long taskId);
}