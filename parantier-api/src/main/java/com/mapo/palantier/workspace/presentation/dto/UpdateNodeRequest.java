package com.mapo.palantier.workspace.presentation.dto;

import com.mapo.palantier.workspace.domain.NodePriority;
import com.mapo.palantier.workspace.domain.NodeStatus;
import com.mapo.palantier.workspace.domain.NodeType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateNodeRequest {
    private String name;
    private String description;
    private NodeType nodeType;
    private NodeStatus status;
    private NodePriority priority;
    private Long parentId;
    private Integer orderNum;
    private Long assignedTo;
    private LocalDateTime dueDate;
    private Boolean isActive;
}
