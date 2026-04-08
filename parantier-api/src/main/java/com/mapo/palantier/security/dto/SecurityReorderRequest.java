package com.mapo.palantier.security.dto;

import lombok.Data;

import java.util.List;

@Data
public class SecurityReorderRequest {
    private List<ReorderItem> items;

    @Data
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
