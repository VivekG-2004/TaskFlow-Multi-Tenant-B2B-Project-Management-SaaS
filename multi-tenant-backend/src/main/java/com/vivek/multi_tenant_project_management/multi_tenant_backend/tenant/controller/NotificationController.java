package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.controller;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.response.ApiResponse;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.Notification;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getAllNotifications(
            @AuthenticationPrincipal String email) {
        List<Notification> notifications = notificationService.getAllNotifications(email);
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", notifications));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnreadNotifications(
            @AuthenticationPrincipal String email) {
        List<Notification> notifications = notificationService.getUnreadNotifications(email);
        return ResponseEntity.ok(ApiResponse.success("Unread notifications fetched", notifications));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal String email) {
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}