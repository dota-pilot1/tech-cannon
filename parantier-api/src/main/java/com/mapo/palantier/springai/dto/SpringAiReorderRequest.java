package com.mapo.palantier.springai.dto;
import lombok.Data;
import java.util.List;
@Data
public class SpringAiReorderRequest {
    private List<ReorderItem> items;
    @Data
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
