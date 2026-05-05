package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.MemberInviteRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.UnauthorizedAccessException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.User;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.UserRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.util.PlanLimitChecker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PlanLimitChecker planLimitChecker;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private MemberService memberService;

    private User ownerUser;
    private User memberUser;
    private MemberInviteRequest inviteRequest;

    @BeforeEach
    void setUp() {
        ownerUser = new User();
        ownerUser.setId(1L);
        ownerUser.setEmail("owner@google.com");
        ownerUser.setRole(User.Role.OWNER);

        memberUser = new User();
        memberUser.setId(2L);
        memberUser.setEmail("member@google.com");
        memberUser.setRole(User.Role.MEMBER);

        inviteRequest = new MemberInviteRequest();
        inviteRequest.setEmail("newmember@google.com");
        inviteRequest.setFullName("New Member");
        inviteRequest.setRole("MEMBER");
    }

    @Test
    void inviteMember_success() {
        when(userRepository.findByEmail("owner@google.com")).thenReturn(Optional.of(ownerUser));
        when(userRepository.existsByEmail("newmember@google.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(memberUser);
        doNothing().when(auditService).log(any(), any(), any(), any(), any(), any());

        User result = memberService.inviteMember(inviteRequest, "owner@google.com");

        assertNotNull(result);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void inviteMember_memberRoleRequester_throwsException() {
        when(userRepository.findByEmail("member@google.com")).thenReturn(Optional.of(memberUser));

        assertThrows(UnauthorizedAccessException.class, () ->
                memberService.inviteMember(inviteRequest, "member@google.com"));

        verify(userRepository, never()).save(any());
    }

    @Test
    void inviteMember_duplicateEmail_throwsException() {
        when(userRepository.findByEmail("owner@google.com")).thenReturn(Optional.of(ownerUser));
        when(userRepository.existsByEmail("newmember@google.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () ->
                memberService.inviteMember(inviteRequest, "owner@google.com"));
    }

    @Test
    void removeMember_ownerCannotBeRemoved_throwsException() {
        User targetOwner = new User();
        targetOwner.setId(3L);
        targetOwner.setRole(User.Role.OWNER);

        when(userRepository.findByEmail("owner@google.com")).thenReturn(Optional.of(ownerUser));
        when(userRepository.findById(3L)).thenReturn(Optional.of(targetOwner));

        assertThrows(UnauthorizedAccessException.class, () ->
                memberService.removeMember(3L, "owner@google.com"));
    }

    @Test
    void removeMember_memberRoleRequester_throwsException() {
        when(userRepository.findByEmail("member@google.com")).thenReturn(Optional.of(memberUser));

        assertThrows(UnauthorizedAccessException.class, () ->
                memberService.removeMember(2L, "member@google.com"));
    }

    @Test
    void getAllMembers_returnsList() {
        when(userRepository.findAll()).thenReturn(List.of(ownerUser, memberUser));

        List<User> result = memberService.getAllMembers();

        assertEquals(2, result.size());
    }

    @Test
    void changeMemberRole_ownerRoleCannotBeChanged_throwsException() {
        User targetOwner = new User();
        targetOwner.setId(3L);
        targetOwner.setRole(User.Role.OWNER);

        when(userRepository.findByEmail("owner@google.com")).thenReturn(Optional.of(ownerUser));
        when(userRepository.findById(3L)).thenReturn(Optional.of(targetOwner));

        assertThrows(UnauthorizedAccessException.class, () ->
                memberService.changeMemberRole(3L, "ADMIN", "owner@google.com"));
    }
}