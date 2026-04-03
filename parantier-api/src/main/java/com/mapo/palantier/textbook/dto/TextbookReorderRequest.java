package com.mapo.palantier.textbook.dto;

import lombok.Data;

import java.util.List;

@Data
public class TextbookReorderRequest {
    private List<ReorderItem> items;

    @Data
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
