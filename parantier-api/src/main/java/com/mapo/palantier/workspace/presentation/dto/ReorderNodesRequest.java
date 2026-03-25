package com.mapo.palantier.workspace.presentation.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReorderNodesRequest {
    private Long parentId;
    private List<Long> nodeIds;
}
