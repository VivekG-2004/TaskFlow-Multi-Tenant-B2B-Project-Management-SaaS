package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.LoginRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.UnauthorizedAccessException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.Tenant;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository.TenantRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.security.JwtUtil;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.User;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private Tenant testTenant;
    private User testUser;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testTenant = new Tenant();
        testTenant.setId(1L);
        testTenant.setSlug("google");
        testTenant.setIsActive(true);

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("owner@google.com");
        testUser.setPassword("encodedPassword");
        testUser.setRole(User.Role.OWNER);
        testUser.setIsActive(true);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("owner@google.com");
        loginRequest.setPassword("password123");
        loginRequest.setTenantSlug("google");
    }

    @Test
    void login_success_returnsToken() {
        when(tenantRepository.findBySlug("google")).thenReturn(Optional.of(testTenant));
        when(userRepository.findByEmail("owner@google.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateTenantToken(any(), any(), any())).thenReturn("mock.jwt.token");

        Map<String, Object> result = authService.login(loginRequest);

        assertNotNull(result);
        assertEquals("mock.jwt.token", result.get("token"));
        assertEquals("owner@google.com", result.get("email"));
    }

    @Test
    void login_wrongPassword_throwsException() {
        when(tenantRepository.findBySlug("google")).thenReturn(Optional.of(testTenant));
        when(userRepository.findByEmail("owner@google.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(false);

        assertThrows(UnauthorizedAccessException.class, () ->
                authService.login(loginRequest));
    }

    @Test
    void login_tenantNotFound_throwsException() {
        when(tenantRepository.findBySlug("google")).thenReturn(Optional.empty());

        assertThrows(Exception.class, () ->
                authService.login(loginRequest));
    }

    @Test
    void login_suspendedTenant_throwsException() {
        testTenant.setIsActive(false);
        when(tenantRepository.findBySlug("google")).thenReturn(Optional.of(testTenant));

        assertThrows(UnauthorizedAccessException.class, () ->
                authService.login(loginRequest));
    }

    @Test
    void login_inactiveUser_throwsException() {
        testUser.setIsActive(false);
        when(tenantRepository.findBySlug("google")).thenReturn(Optional.of(testTenant));
        when(userRepository.findByEmail("owner@google.com")).thenReturn(Optional.of(testUser));

        assertThrows(UnauthorizedAccessException.class, () ->
                authService.login(loginRequest));
    }
}