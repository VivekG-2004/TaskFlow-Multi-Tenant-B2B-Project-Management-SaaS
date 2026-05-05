package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.ProjectRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.PlanLimitExceededException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.UnauthorizedAccessException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.Project;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.User;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.ProjectMemberRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.ProjectRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.UserRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.util.PlanLimitChecker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectMemberRepository projectMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PlanLimitChecker planLimitChecker;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private ProjectService projectService;

    private User testUser;
    private Project testProject;
    private ProjectRequest projectRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("owner@google.com");
        testUser.setRole(User.Role.OWNER);

        testProject = new Project();
        testProject.setId(1L);
        testProject.setName("Test Project");
        testProject.setIsArchived(false);

        projectRequest = new ProjectRequest();
        projectRequest.setName("Test Project");
        projectRequest.setDescription("Test Description");
    }

    @Test
    void createProject_success() {
        when(userRepository.findByEmail("owner@google.com")).thenReturn(Optional.of(testUser));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);
        doNothing().when(auditService).log(any(), any(), any(), any(), any(), any());

        Project result = projectService.createProject(projectRequest, "owner@google.com");

        assertNotNull(result);
        assertEquals("Test Project", result.getName());
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void createProject_planLimitExceeded_throwsException() {
        doThrow(new PlanLimitExceededException("Project limit reached"))
                .when(planLimitChecker).enforceProjectLimit(anyLong());

        assertThrows(PlanLimitExceededException.class, () ->
                projectService.createProject(projectRequest, "owner@google.com"));

        verify(projectRepository, never()).save(any());
    }

    @Test
    void getProjectById_userNotMember_throwsException() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(userRepository.findByEmail("owner@google.com")).thenReturn(Optional.of(testUser));
        when(projectMemberRepository.existsByProjectIdAndUserId(1L, 1L)).thenReturn(false);

        assertThrows(UnauthorizedAccessException.class, () ->
                projectService.getProjectById(1L, "owner@google.com"));
    }

    @Test
    void getProjectById_userIsMember_returnsProject() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(userRepository.findByEmail("owner@google.com")).thenReturn(Optional.of(testUser));
        when(projectMemberRepository.existsByProjectIdAndUserId(1L, 1L)).thenReturn(true);

        Project result = projectService.getProjectById(1L, "owner@google.com");

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void getAllProjects_returnsActiveProjects() {
        when(projectRepository.findByIsArchivedFalse()).thenReturn(List.of(testProject));

        List<Project> result = projectService.getAllProjects();

        assertEquals(1, result.size());
        verify(projectRepository, times(1)).findByIsArchivedFalse();
    }
}