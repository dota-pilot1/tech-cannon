package com.mapo.palantier.sql.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableInfo {

    private String tableName;
    private List<ColumnInfo> columns;
    private long rowCount;
}
