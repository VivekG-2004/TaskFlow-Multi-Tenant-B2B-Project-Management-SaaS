package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.ProjectRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.PlanLimitExceededException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.ResourceNotFoundException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.UnauthorizedAccessException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.Tenant;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.TenantPlan;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository.TenantPlanRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository.TenantRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.config.TenantContext;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.Project;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.ProjectMember;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.User;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.ProjectMemberRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.ProjectRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.UserRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.util.PlanLimitChecker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final TenantPlanRepository tenantPlanRepository;
    private final AuditService auditService;
    private final PlanLimitChecker planLimitChecker;

    public Project createProject(ProjectRequest request, String creatorEmail) {

        // 1. enforce plan limits
        planLimitChecker.enforceProjectLimit(projectRepository.countByIsArchivedFalse());

        // 2. get creator
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 3. create project
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setDueDate(request.getDueDate());
        project.setStatus(Project.Status.PLANNING);
        project.setIsArchived(false);
        project.setCreatedBy(creator.getId());
        project.setCreatedAt(LocalDateTime.now());
        project = projectRepository.save(project);

        // 4. add creator as project member
        ProjectMember member = new ProjectMember();
        member.setProjectId(project.getId());
        member.setUserId(creator.getId());
        member.setAddedAt(LocalDateTime.now());
        projectMemberRepository.save(member);

        // 5. audit log
        auditService.log(creator.getId(), "CREATE", "PROJECT", project.getId(), null, project);

        return project;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(Long projectId, String userEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, user.getId())) {
            throw new UnauthorizedAccessException("You are not a member of this project");
        }

        return project;
    }

    public Project updateProject(Long projectId, ProjectRequest request, String userEmail) {
        Project project = getProjectById(projectId, userEmail);
        Object oldValue = project.toString();

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStartDate(request.getStartDate());
        project.setDueDate(request.getDueDate());
        project.setUpdatedAt(LocalDateTime.now());

        if (request.getStatus() != null) {
            project.setStatus(Project.Status.valueOf(request.getStatus()));
        }

        Project updated = projectRepository.save(project);

        User user = userRepository.findByEmail(userEmail).get();
        auditService.log(user.getId(), "UPDATE", "PROJECT", projectId, oldValue, updated);

        return updated;
    }

    public void archiveProject(Long projectId, String userEmail) {
        Project project = getProjectById(projectId, userEmail);
        project.setIsArchived(true);
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(project);

        User user = userRepository.findByEmail(userEmail).get();
        auditService.log(user.getId(), "DELETE", "PROJECT", projectId, null, null);
    }

    public void unarchiveProject(Long projectId, String userEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        project.setIsArchived(false);
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(project);

        User user = userRepository.findByEmail(userEmail).get();
        auditService.log(user.getId(), "UPDATE", "PROJECT", projectId, null, null);
    }

    public Project addMemberToProject(Long projectId, Long userId, String requesterEmail) {
        Project project = getProjectById(projectId, requesterEmail);

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new IllegalArgumentException("User is already a member of this project");
        }

        ProjectMember member = new ProjectMember();
        member.setProjectId(projectId);
        member.setUserId(userId);
        member.setAddedAt(LocalDateTime.now());
        projectMemberRepository.save(member);

        return project;
    }
}