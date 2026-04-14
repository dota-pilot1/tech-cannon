package com.mapo.palantier.skillcore.dto;
import lombok.Data;
import java.util.List;
@Data
public class SkillCoreReorderRequest {
    private List<ReorderItem> items;
    @Data
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
