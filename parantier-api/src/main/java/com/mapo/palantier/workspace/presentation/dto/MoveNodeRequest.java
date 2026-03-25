package com.mapo.palantier.workspace.presentation.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MoveNodeRequest {
    private Long parentId;
    private Integer orderNum;
}
