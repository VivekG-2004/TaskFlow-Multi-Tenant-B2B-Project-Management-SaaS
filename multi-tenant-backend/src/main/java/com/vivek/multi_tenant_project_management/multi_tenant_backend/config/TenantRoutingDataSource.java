package com.vivek.multi_tenant_project_management.multi_tenant_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

public class TenantRoutingDataSource extends AbstractRoutingDataSource {

    @Value("${spring.datasource.master.username}")
    private String username;

    @Value("${spring.datasource.master.password}")
    private String password;

    @Override
    protected Object determineCurrentLookupKey() {
        return TenantContext.getTenantId();
    }

    public void addTenantDataSource(String tenantSlug, String schemaName) {
        Map<Object, Object> currentSources = new HashMap<>(this.getResolvedDataSources());

        DataSource tenantDataSource = DataSourceBuilder.create()
                .url("jdbc:mysql://localhost:3306/" + schemaName +
                        "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC")
                .username(username)
                .password(password)
                .driverClassName("com.mysql.cj.jdbc.Driver")
                .build();

        currentSources.put(tenantSlug, tenantDataSource);
        this.setTargetDataSources(currentSources);
        this.afterPropertiesSet();
    }
}