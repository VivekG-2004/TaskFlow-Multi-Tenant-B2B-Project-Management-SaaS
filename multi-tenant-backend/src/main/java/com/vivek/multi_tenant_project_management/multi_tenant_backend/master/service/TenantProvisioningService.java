package com.vivek.multi_tenant_project_management.multi_tenant_backend.master.service;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.config.TenantContext;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.config.TenantRoutingDataSource;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.TenantRegistrationRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.exception.TenantNotFoundException;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.Tenant;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository.TenantRepository;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.User;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantProvisioningService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantRoutingDataSource tenantRoutingDataSource;

    @Qualifier("masterDataSource")
    private final DataSource masterDataSource;

    public Tenant provisionTenant(TenantRegistrationRequest request) {
        // 1. generate slug from company name
        String slug = generateSlug(request.getCompanyName());
        String schemaName = "tenant_" + slug;

        // 2. check duplicates
        if (tenantRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Company name already taken");
        }
        if (tenantRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // 3. create schema in MySQL
        createSchema(schemaName);

        // 4. run flyway migrations on new schema
        runFlywayMigrations(schemaName);
        tenantRoutingDataSource.addTenantDataSource(slug, schemaName);
        log.info("Tenant datasource registered for slug: {}", slug);

        // 5. save tenant in master schema
        Tenant tenant = new Tenant();
        tenant.setCompanyName(request.getCompanyName());
        tenant.setSlug(slug);
        tenant.setEmail(request.getEmail());
        tenant.setSchemaName(schemaName);
        tenant.setPlan(Tenant.Plan.FREE);
        tenant.setIsActive(true);
        tenant.setCreatedAt(LocalDateTime.now());
        tenantRepository.save(tenant);

        // 6. create OWNER user inside tenant schema
        TenantContext.setTenantId(slug);
        log.info("TenantContext set to: {}", TenantContext.getTenantId());
        try {
            User owner = new User();
            owner.setEmail(request.getEmail());
            owner.setPassword(passwordEncoder.encode(request.getPassword()));
            owner.setFullName(request.getFullName());
            owner.setRole(User.Role.OWNER);
            owner.setIsActive(true);
            owner.setCreatedAt(LocalDateTime.now());
            userRepository.save(owner);
            log.info("Owner saved with id: {}", owner.getId());
        } finally {
            TenantContext.clear();
        }

        log.info("Tenant provisioned successfully: {}", schemaName);
        return tenant;
    }

    private void createSchema(String schemaName) {
        try (Connection connection = masterDataSource.getConnection();
             Statement statement = connection.createStatement()) {
            statement.executeUpdate("CREATE SCHEMA IF NOT EXISTS `" + schemaName + "`");
            log.info("Schema created: {}", schemaName);
        } catch (Exception e) {
            log.error("Failed to create schema: {}", schemaName, e);
            throw new RuntimeException("Failed to create tenant schema: " + e.getMessage());
        }
    }

    private void runFlywayMigrations(String schemaName) {
        try {
            Flyway flyway = Flyway.configure()
                    .dataSource(masterDataSource)
                    .schemas(schemaName)
                    .locations("classpath:db/tenant/migration")
                    .baselineOnMigrate(true)
                    .load();
            flyway.migrate();
            log.info("Flyway migrations applied to schema: {}", schemaName);
        } catch (Exception e) {
            log.error("Flyway migration failed for schema: {}", schemaName, e);
            // compensate — drop schema if migration fails
            dropSchema(schemaName);
            throw new RuntimeException("Migration failed: " + e.getMessage());
        }
    }

    private void dropSchema(String schemaName) {
        try (Connection connection = masterDataSource.getConnection();
             Statement statement = connection.createStatement()) {
            statement.executeUpdate("DROP SCHEMA IF EXISTS `" + schemaName + "`");
            log.warn("Schema dropped due to migration failure: {}", schemaName);
        } catch (Exception e) {
            log.error("Failed to drop schema after migration failure: {}", schemaName, e);
        }
    }

    private String generateSlug(String companyName) {
        return companyName.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "_");
    }

    public Tenant getTenantBySlug(String slug) {
        return tenantRepository.findBySlug(slug)
                .orElseThrow(() -> new TenantNotFoundException("Tenant not found: " + slug));
    }
}