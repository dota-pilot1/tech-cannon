package com.mapo.palantier.apidoc.dto;

import lombok.Data;

import java.util.List;

@Data
public class ApiDocReorderRequest {
    private List<ReorderItem> items;

    @Data
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
