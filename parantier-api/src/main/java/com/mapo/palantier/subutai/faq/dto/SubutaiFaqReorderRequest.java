package com.mapo.palantier.subutai.faq.dto;

import lombok.Data;

import java.util.List;

@Data
public class SubutaiFaqReorderRequest {
    private List<ReorderItem> items;

    @Data
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
