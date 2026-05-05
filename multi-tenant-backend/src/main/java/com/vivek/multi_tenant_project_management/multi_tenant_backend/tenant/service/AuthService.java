package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.config.TenantContext;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.LoginRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.TenantNotFoundException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.UnauthorizedAccessException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.Tenant;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository.TenantRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.security.JwtUtil;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.User;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public Map<String, Object> login(LoginRequest request) {

        // 1. validate tenant exists and is active
        Tenant tenant = tenantRepository.findBySlug(request.getTenantSlug())
                .orElseThrow(() -> new TenantNotFoundException("Tenant not found"));

        if (!tenant.getIsActive()) {
            throw new UnauthorizedAccessException("Tenant account is suspended");
        }

        // 2. set tenant context so userRepository hits correct schema
        TenantContext.setTenantId(request.getTenantSlug());

        try {
            // 3. find user in tenant schema
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UnauthorizedAccessException("Invalid credentials"));

            log.info("User found: {}", user.getEmail());
            log.info("Stored password hash: {}", user.getPassword());
            log.info("Input password: {}", request.getPassword());
            log.info("Password match: {}", passwordEncoder.matches(request.getPassword(), user.getPassword()));

            if (!user.getIsActive()) {
                throw new UnauthorizedAccessException("User account is inactive");
            }

            // 4. verify password
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            // 5. update last login
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // 6. generate token
            String token = jwtUtil.generateTenantToken(
                    user.getEmail(),
                    request.getTenantSlug(),
                    user.getRole().name()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("role", user.getRole());
            response.put("tenantSlug", request.getTenantSlug());

            return response;

        } finally {
            TenantContext.clear();
        }
    }
}