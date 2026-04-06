package com.mapo.palantier.hackathon.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter @Setter @NoArgsConstructor
public class HackathonDocReorderRequest {
    private List<ReorderItem> items;

    @Getter @Setter @NoArgsConstructor
    public static class ReorderItem {
        private Long id;
        private Integer orderNum;
    }
}
