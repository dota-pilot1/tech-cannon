package com.mapo.palantier.architecture.dto;

import lombok.Data;

import java.util.List;

@Data
public class ReorderRequest {
    private List<ReorderItem> items;

    @Data
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
