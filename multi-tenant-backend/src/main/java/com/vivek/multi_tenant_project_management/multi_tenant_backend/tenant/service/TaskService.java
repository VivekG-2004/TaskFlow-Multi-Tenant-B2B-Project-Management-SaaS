package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.TaskRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.ResourceNotFoundException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.UnauthorizedAccessException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.Task;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.TaskActivity;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.User;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.ProjectMemberRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.TaskActivityRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.TaskRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskActivityRepository taskActivityRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public Task createTask(TaskRequest request, String creatorEmail) {

        // 1. get creator
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 2. verify creator is project member
        if (!projectMemberRepository.existsByProjectIdAndUserId(request.getProjectId(), creator.getId())) {
            throw new UnauthorizedAccessException("You are not a member of this project");
        }

        // 3. create task
        Task task = new Task();
        task.setProjectId(request.getProjectId());
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority() != null ?
                Task.Priority.valueOf(request.getPriority()) : Task.Priority.MEDIUM);
        task.setStatus(Task.Status.TODO);
        task.setAssigneeId(request.getAssigneeId());
        task.setDueDate(request.getDueDate());
        task.setParentId(request.getParentId());
        task.setCreatedBy(creator.getId());
        task.setCreatedAt(LocalDateTime.now());
        task = taskRepository.save(task);

        // 4. notify assignee if assigned
        if (request.getAssigneeId() != null) {
            notificationService.notifyTaskAssigned(request.getAssigneeId(), task.getTitle());
        }

        // 5. audit log
        auditService.log(creator.getId(), "CREATE", "TASK", task.getId(), null, task);

        return task;
    }

    public List<Task> getTasksByProject(Long projectId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, user.getId())) {
            throw new UnauthorizedAccessException("You are not a member of this project");
        }

        return taskRepository.findByProjectId(projectId);
    }

    public Task updateTaskStatus(Long taskId, String newStatus, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        String oldStatus = task.getStatus().name();
        task.setStatus(Task.Status.valueOf(newStatus));
        task.setUpdatedAt(LocalDateTime.now());
        task = taskRepository.save(task);

        // record activity
        recordActivity(taskId, user.getId(), "changed status from " + oldStatus + " to " + newStatus,
                "status", oldStatus, newStatus);

        // audit log
        auditService.log(user.getId(), "UPDATE", "TASK", taskId, oldStatus, newStatus);

        return task;
    }

    public Task updateTask(Long taskId, TaskRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        Long oldAssigneeId = task.getAssigneeId();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setAssigneeId(request.getAssigneeId());
        if (request.getPriority() != null) {
            task.setPriority(Task.Priority.valueOf(request.getPriority()));
        }
        task.setUpdatedAt(LocalDateTime.now());
        task = taskRepository.save(task);

        // notify new assignee if changed
        if (request.getAssigneeId() != null && !request.getAssigneeId().equals(oldAssigneeId)) {
            notificationService.notifyTaskAssigned(request.getAssigneeId(), task.getTitle());
        }

        auditService.log(user.getId(), "UPDATE", "TASK", taskId, null, task);

        return task;
    }

    public void deleteTask(Long taskId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        taskRepository.delete(task);
        auditService.log(user.getId(), "DELETE", "TASK", taskId, task, null);
    }

    public List<Task> getSubtasks(Long parentId) {
        return taskRepository.findByParentId(parentId);
    }

    public List<TaskActivity> getTaskActivities(Long taskId) {
        return taskActivityRepository.findByTaskId(taskId);
    }

    private void recordActivity(Long taskId, Long userId, String action,
                                String fieldName, String oldValue, String newValue) {
        TaskActivity activity = new TaskActivity();
        activity.setTaskId(taskId);
        activity.setUserId(userId);
        activity.setAction(action);
        activity.setFieldName(fieldName);
        activity.setOldValue(oldValue);
        activity.setNewValue(newValue);
        activity.setCreatedAt(LocalDateTime.now());
        taskActivityRepository.save(activity);
    }
}