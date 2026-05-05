package com.vivek.multi_tenant_project_management.multi_tenant_backend.config;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.repository.TenantRepository;
import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Slf4j
@Configuration
public class MasterFlywayConfig implements ApplicationRunner {

    private final DataSource masterDataSource;
    private final TenantRoutingDataSource tenantRoutingDataSource;
    private final TenantRepository tenantRepository;

    public MasterFlywayConfig(@Qualifier("masterDataSource") DataSource masterDataSource,
                              TenantRoutingDataSource tenantRoutingDataSource,
                              TenantRepository tenantRepository) {
        this.masterDataSource = masterDataSource;
        this.tenantRoutingDataSource = tenantRoutingDataSource;
        this.tenantRepository = tenantRepository;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("Running Flyway migrations on master schema...");
        Flyway flyway = Flyway.configure()
                .dataSource(masterDataSource)
                .schemas("taskflow_master")
                .locations("classpath:db/master/migration")
                .baselineOnMigrate(true)
                .load();
        flyway.migrate();
        log.info("Master schema migration completed.");

        log.info("Loading existing tenants into routing datasource...");
        tenantRepository.findAll().forEach(tenant -> {
            tenantRoutingDataSource.addTenantDataSource(
                    tenant.getSlug(),
                    tenant.getSchemaName()
            );
            log.info("Loaded tenant: {}", tenant.getSlug());
        });
        log.info("All tenants loaded.");

        // temporary — remove after first run
//        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder =
//                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
//        String hash = encoder.encode("superadmin123");
//        log.info("SUPER ADMIN PASSWORD HASH: {}", hash);

    }
}