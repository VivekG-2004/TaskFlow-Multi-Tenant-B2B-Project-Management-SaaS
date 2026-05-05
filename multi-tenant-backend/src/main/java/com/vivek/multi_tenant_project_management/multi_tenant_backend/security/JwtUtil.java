package com.vivek.multi_tenant_project_management.multi_tenant_backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.jwt.super-admin-secret}")
    private String superAdminSecret;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(hexStringToByteArray(jwtSecret));
    }

    private Key getSuperAdminSigningKey() {
        return Keys.hmacShaKeyFor(hexStringToByteArray(superAdminSecret));
    }

    // ─── Tenant User Token ───────────────────────────────────

    public String generateTenantToken(String email, String tenantSlug, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("tenantSlug", tenantSlug)
                .claim("role", role)
                .claim("type", "TENANT")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractTenantClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ─── Super Admin Token ───────────────────────────────────

    public String generateSuperAdminToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("type", "SUPER_ADMIN")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSuperAdminSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractSuperAdminClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSuperAdminSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ─── Common ──────────────────────────────────────────────

    public boolean isTokenValid(String token, boolean isSuperAdmin) {
        try {
            if (isSuperAdmin) {
                extractSuperAdminClaims(token);
            } else {
                extractTenantClaims(token);
            }
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private byte[] hexStringToByteArray(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }
}