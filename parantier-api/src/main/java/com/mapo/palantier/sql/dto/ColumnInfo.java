package com.mapo.palantier.sql.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ColumnInfo {

    private int cid;
    private String name;
    private String type;
    private boolean notNull;
    private String defaultValue;
    private boolean primaryKey;
}
