package com.vivek.multi_tenant_project_management.multi_tenant_backend.security;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.config.TenantContext;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String token = extractToken(request);

            if (token == null) {
                filterChain.doFilter(request, response);
                return;
            }

            // check if super admin token first
            if (jwtUtil.isTokenValid(token, true)) {
                Claims claims = jwtUtil.extractSuperAdminClaims(token);
                String type = claims.get("type", String.class);

                if ("SUPER_ADMIN".equals(type)) {
                    setAuthentication(claims.getSubject(), "ROLE_SUPER_ADMIN");
                    filterChain.doFilter(request, response);
                    return;
                }
            }

            // tenant user token
            if (jwtUtil.isTokenValid(token, false)) {
                Claims claims = jwtUtil.extractTenantClaims(token);
                String tenantSlug = claims.get("tenantSlug", String.class);
                String role = claims.get("role", String.class);

                TenantContext.setTenantId(tenantSlug);
                setAuthentication(claims.getSubject(), "ROLE_" + role);
            }

            filterChain.doFilter(request, response);

        } finally {
            // CRITICAL — always clear ThreadLocal after request
            TenantContext.clear();
        }
    }

    private void setAuthentication(String email, String role) {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(new SimpleGrantedAuthority(role))
                );
        authentication.setDetails(email);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}