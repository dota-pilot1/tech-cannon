package com.mapo.palantier.frontend.dto;

import lombok.Data;

import java.util.List;

@Data
public class FrontendReorderRequest {
    private List<ReorderItem> items;

    @Data
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
