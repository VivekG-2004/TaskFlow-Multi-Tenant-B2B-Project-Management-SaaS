package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.controller;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.MemberInviteRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.response.ApiResponse;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.response.MemberInviteResponse;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.User;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<  MemberInviteResponse>> inviteMember(
            @Valid @RequestBody MemberInviteRequest request,
            @AuthenticationPrincipal String email) {
        MemberInviteResponse response = memberService.inviteMember(request, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Member invited successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllMembers() {
        List<User> members = memberService.getAllMembers();
        return ResponseEntity.ok(ApiResponse.success("Members fetched", members));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<User>> changeRole(
            @PathVariable Long id,
            @RequestParam String role,
            @AuthenticationPrincipal String email) {
        User user = memberService.changeMemberRole(id, role, email);
        return ResponseEntity.ok(ApiResponse.success("Role updated", user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        memberService.removeMember(id, email);
        return ResponseEntity.ok(ApiResponse.success("Member removed"));
    }
}