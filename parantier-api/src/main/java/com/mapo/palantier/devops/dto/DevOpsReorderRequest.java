package com.mapo.palantier.devops.dto;
import lombok.Data;
import java.util.List;

@Data
public class DevOpsReorderRequest {
    private List<ReorderItem> items;

    @Data
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
