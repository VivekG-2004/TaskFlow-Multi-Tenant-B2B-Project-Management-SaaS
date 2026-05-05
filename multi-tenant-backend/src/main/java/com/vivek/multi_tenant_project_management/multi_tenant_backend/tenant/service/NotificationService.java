package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.ResourceNotFoundException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.Notification;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.User;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.NotificationRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void notifyTaskAssigned(Long userId, String taskTitle) {
        createNotification(
                userId,
                "Task Assigned",
                "You have been assigned to task: " + taskTitle
        );
    }

    public void notifyTaskCommented(Long userId, String taskTitle, String commenterName) {
        createNotification(
                userId,
                "New Comment",
                commenterName + " commented on your task: " + taskTitle
        );
    }

    public void notifyDueDateApproaching(Long userId, String taskTitle) {
        createNotification(
                userId,
                "Due Date Approaching",
                "Task due soon: " + taskTitle
        );
    }

    public List<Notification> getUnreadNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.findByUserIdAndIsReadFalse(user.getId());
    }

    public List<Notification> getAllNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.findByUserId(user.getId());
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    private void createNotification(Long userId, String title, String body) {
        try {
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setTitle(title);
            notification.setBody(body);
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        } catch (Exception e) {
            // notification failure should never break main flow
            log.error("Failed to create notification for user: {}", userId, e);
        }
    }
}