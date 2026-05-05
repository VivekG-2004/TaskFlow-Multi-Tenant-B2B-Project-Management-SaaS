package com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.response;

import lombok.Data;

@Data
public class MemberInviteResponse {
    private Long id;
    private String email;
    private String fullName;
    private String role;
    private String tempPassword;
}