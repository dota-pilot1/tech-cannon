package com.mapo.palantier.faq.dto;

import lombok.Data;

import java.util.List;

@Data
public class FaqReorderRequest {
    private List<ReorderItem> items;

    @Data
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
