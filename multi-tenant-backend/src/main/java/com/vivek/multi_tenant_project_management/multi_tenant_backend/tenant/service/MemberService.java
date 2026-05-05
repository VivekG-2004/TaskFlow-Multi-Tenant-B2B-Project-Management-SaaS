package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.config.TenantContext;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.MemberInviteRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.response.MemberInviteResponse;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.PlanLimitExceededException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.ResourceNotFoundException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.UnauthorizedAccessException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.Tenant;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.TenantPlan;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository.TenantPlanRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository.TenantRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.User;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.UserRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.util.PlanLimitChecker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final TenantPlanRepository tenantPlanRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final PlanLimitChecker planLimitChecker;

    public MemberInviteResponse inviteMember(MemberInviteRequest request, String requesterEmail) {

        // 1. only OWNER or ADMIN can invite
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (requester.getRole() == User.Role.MEMBER) {
            throw new UnauthorizedAccessException("Only OWNER or ADMIN can invite members");
        }

        // 2. enforce plan limit
        planLimitChecker.enforceMemberLimit(userRepository.count());

        // 3. check duplicate
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User already exists in this tenant");
        }

        // 4. create user with temp password
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);

        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setFullName(request.getFullName());
        newUser.setPassword(passwordEncoder.encode(tempPassword));
        newUser.setRole(User.Role.valueOf(request.getRole().toUpperCase()));
        newUser.setIsActive(true);
        newUser.setInvitedBy(requester.getId());
        newUser.setCreatedAt(LocalDateTime.now());
        newUser = userRepository.save(newUser);

        // 5. audit log
        auditService.log(requester.getId(), "CREATE", "MEMBER", newUser.getId(), null, newUser);

        // in real world — send email with tempPassword here
        log.info("Member invited: {} with temp password: {}", request.getEmail(), tempPassword);

        MemberInviteResponse response = new MemberInviteResponse();
        response.setId(newUser.getId());
        response.setEmail(newUser.getEmail());
        response.setFullName(newUser.getFullName());
        response.setRole(newUser.getRole().name());
        response.setTempPassword(tempPassword);
        return response;
    }

    public List<User> getAllMembers() {
        return userRepository.findAll();
    }

    public User changeMemberRole(Long userId, String newRole, String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (requester.getRole() != User.Role.OWNER && requester.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedAccessException("Only OWNER or ADMIN can change roles");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // OWNER role cannot be changed
        if (user.getRole() == User.Role.OWNER) {
            throw new UnauthorizedAccessException("OWNER role cannot be changed");
        }

        String oldRole = user.getRole().name();
        user.setRole(User.Role.valueOf(newRole.toUpperCase()));
        user = userRepository.save(user);

        auditService.log(requester.getId(), "UPDATE", "MEMBER", userId, oldRole, newRole);

        return user;
    }

    public void removeMember(Long userId, String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (requester.getRole() != User.Role.OWNER && requester.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedAccessException("Only OWNER or ADMIN can remove members");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == User.Role.OWNER) {
            throw new UnauthorizedAccessException("OWNER cannot be removed");
        }

        user.setIsActive(false);
        userRepository.save(user);

        auditService.log(requester.getId(), "DELETE", "MEMBER", userId, user, null);
    }
    
}