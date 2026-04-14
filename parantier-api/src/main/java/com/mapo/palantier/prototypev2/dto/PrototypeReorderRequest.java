package com.mapo.palantier.prototypev2.dto;
import lombok.Data;
import java.util.List;
@Data
public class PrototypeReorderRequest {
    private List<ReorderItem> items;
    @Data
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
