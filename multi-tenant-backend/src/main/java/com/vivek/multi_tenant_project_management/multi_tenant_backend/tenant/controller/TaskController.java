package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.controller;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.TaskRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.response.ApiResponse;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.Task;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.TaskActivity;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<ApiResponse<Task>> createTask(
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal String email) {
        Task task = taskService.createTask(request, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created", task));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<Task>>> getTasksByProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal String email) {
        List<Task> tasks = taskService.getTasksByProject(projectId, email);
        return ResponseEntity.ok(ApiResponse.success("Tasks fetched", tasks));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Task>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal String email) {
        Task task = taskService.updateTask(id, request, email);
        return ResponseEntity.ok(ApiResponse.success("Task updated", task));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Task>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal String email) {
        Task task = taskService.updateTaskStatus(id, status, email);
        return ResponseEntity.ok(ApiResponse.success("Task status updated", task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        taskService.deleteTask(id, email);
        return ResponseEntity.ok(ApiResponse.success("Task deleted"));
    }

    @GetMapping("/{id}/subtasks")
    public ResponseEntity<ApiResponse<List<Task>>> getSubtasks(@PathVariable Long id) {
        List<Task> subtasks = taskService.getSubtasks(id);
        return ResponseEntity.ok(ApiResponse.success("Subtasks fetched", subtasks));
    }

    @GetMapping("/{id}/activities")
    public ResponseEntity<ApiResponse<List<TaskActivity>>> getActivities(@PathVariable Long id) {
        List<TaskActivity> activities = taskService.getTaskActivities(id);
        return ResponseEntity.ok(ApiResponse.success("Activities fetched", activities));
    }
}