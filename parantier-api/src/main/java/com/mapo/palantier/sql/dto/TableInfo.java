package com.mapo.palantier.sql.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class TableInfo {
    private String tableName;
    private List<ColumnInfo> columns;
    private long rowCount;
}
