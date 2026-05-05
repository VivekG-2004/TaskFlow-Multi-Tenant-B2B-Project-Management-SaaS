package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.controller;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.ProjectRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.response.ApiResponse;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.Project;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ApiResponse<Project>> createProject(
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal String email) {
        Project project = projectService.createProject(request, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created", project));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Project>>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        return ResponseEntity.ok(ApiResponse.success("Projects fetched", projects));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Project>> getProject(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        Project project = projectService.getProjectById(id, email);
        return ResponseEntity.ok(ApiResponse.success("Project fetched", project));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Project>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal String email) {
        Project project = projectService.updateProject(id, request, email);
        return ResponseEntity.ok(ApiResponse.success("Project updated", project));
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<Void>> archiveProject(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        projectService.archiveProject(id, email);
        return ResponseEntity.ok(ApiResponse.success("Project archived"));
    }

    @PutMapping("/{id}/unarchive")
    public ResponseEntity<ApiResponse<Void>> unarchiveProject(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        projectService.unarchiveProject(id, email);
        return ResponseEntity.ok(ApiResponse.success("Project unarchived"));
    }

    @PostMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse<Project>> addMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            @AuthenticationPrincipal String email) {
        Project project = projectService.addMemberToProject(id, userId, email);
        return ResponseEntity.ok(ApiResponse.success("Member added to project", project));
    }
}