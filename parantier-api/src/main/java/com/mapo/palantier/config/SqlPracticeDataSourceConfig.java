package com.mapo.palantier.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SqlPracticeDataSourceConfig {

    @Value("${sql.practice.db.path:./sql-practice.db}")
    private String dbBasePath;

    public String getDbPath(int setId) {
        if (setId <= 0 || setId > 10) return dbBasePath;
        String base = dbBasePath.endsWith(".db")
            ? dbBasePath.substring(0, dbBasePath.length() - 3)
            : dbBasePath;
        return base + "-" + setId + ".db";
    }
}
