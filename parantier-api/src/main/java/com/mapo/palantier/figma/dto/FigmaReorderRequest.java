package com.mapo.palantier.figma.dto;

import lombok.Data;

import java.util.List;

@Data
public class FigmaReorderRequest {
    private List<ReorderItem> items;

    @Data
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
