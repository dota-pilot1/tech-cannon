package com.mapo.palantier.core.dto;

import lombok.Data;

import java.util.List;

@Data
public class CoreReorderRequest {
    private List<ReorderItem> items;

    @Data
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
