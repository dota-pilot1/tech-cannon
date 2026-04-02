package com.mapo.palantier.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.sqlite.SQLiteDataSource;

import javax.sql.DataSource;

@Configuration
public class SqlPracticeDataSourceConfig {

    @Value("${sql.practice.db.path:./sql-practice.db}")
    private String dbPath;

    @Bean(name = "sqlPracticeDataSource")
    public DataSource sqlPracticeDataSource() {
        SQLiteDataSource ds = new SQLiteDataSource();
        ds.setUrl("jdbc:sqlite:" + dbPath);
        return ds;
    }
}
