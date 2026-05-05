package com.vivek.multi_tenant_project_management.multi_tenant_backend.util;

public class SlugGenerator {

    public static String generate(String companyName) {
        return companyName.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "_");
    }
}