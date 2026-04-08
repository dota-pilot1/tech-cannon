package com.mapo.palantier.challenge.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChallengeReorderRequest {
    private List<ReorderItem> items;

    @Data
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
