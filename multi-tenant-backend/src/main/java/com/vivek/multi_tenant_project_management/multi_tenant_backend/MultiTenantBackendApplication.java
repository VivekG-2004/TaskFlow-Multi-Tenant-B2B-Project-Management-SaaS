package com.vivek.multi_tenant_project_management.multi_tenant_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {
		DataSourceAutoConfiguration.class,
		HibernateJpaAutoConfiguration.class,
		FlywayAutoConfiguration.class
})

@EnableScheduling
public class MultiTenantBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(MultiTenantBackendApplication.class, args);
	}

}
