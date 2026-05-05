package com.vivek.multi_tenant_project_management.multi_tenant_backend.scheduler;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.config.TenantContext;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository.TenantRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.Task;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.TaskRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final TenantRepository tenantRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    // runs every day at 9 AM
    @Scheduled(cron = "0 0 9 * * *")
    public void checkDueDates() {
        log.info("Running due date check scheduler...");

        tenantRepository.findAll().forEach(tenant -> {
            if (!tenant.getIsActive()) return;

            TenantContext.setTenantId(tenant.getSlug());
            try {
                checkDueDatesForTenant(tenant.getSlug());
            } finally {
                TenantContext.clear();
            }
        });

        log.info("Due date check completed.");
    }

    private void checkDueDatesForTenant(String slug) {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDate threeDaysLater = LocalDate.now().plusDays(3);

        List<Task> tasks = taskRepository.findAll();
        tasks.stream()
                .filter(task -> task.getDueDate() != null)
                .filter(task -> task.getStatus() != Task.Status.DONE)
                .filter(task -> task.getAssigneeId() != null)
                .filter(task -> {
                    LocalDate due = task.getDueDate();
                    return !due.isBefore(LocalDate.now()) &&
                            !due.isAfter(threeDaysLater);
                })
                .forEach(task -> {
                    notificationService.notifyDueDateApproaching(
                            task.getAssigneeId(),
                            task.getTitle()
                    );
                    log.info("Due date notification sent for task: {} in tenant: {}",
                            task.getTitle(), slug);
                });
    }
}