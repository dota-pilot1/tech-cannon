package com.mapo.palantier.sql.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class SqlExecuteResponse {
    private boolean success;
    private String type;
    private List<String> columns;
    private List<Map<String, Object>> rows;
    private int affectedRows;
    private String message;
    private long executionTimeMs;
}
